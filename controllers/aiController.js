// controllers/aiController.js
const { Kakao, Naver, OpenAi } = require('../models/Ai');

exports.getTouristAttraction = async (req, res) => {
    const { startDate, duration, location, companion, days } = req.body;
    try {
        console.log('check');
        const userMessage = `'${startDate}'부터 '${duration}'로 '${location}'지역에 '${companion}' 여행을 갈건데 어느 관광지를 가는게 좋을지 여행 일정동안 관광할 관광지를 반드시 '${location}'지역 내에서 추천해줘. 계절과 동행자를 고려해서 추천해줘. 관광지의 이름만 추천해줘. 설명은 필요없어! 다시한번 말하지만 설명은 반드시 생략해줘 \n다음 예제와 같은 JSON 형식으로 반환 result:\n\n{\"name\": \"해운대 해수욕장\"\n}`;
        const userMSG = await Naver.getTouristSpotsFromClova(userMessage);
        if (!userMSG) {
            return res.status(400).json({ msg: 'Clova API 응답에서 오류 발생' });
        }
        const plan = await OpenAi.parsingSpotNameFromGpt(userMSG);
        let parsedPlan = JSON.parse(plan);
        // 여기에서 parsedPlan.spots 배열을 수정합니다.
        if (parsedPlan.spots.length > days * 5) {
            // 배열의 길이가 days * 5 보다 큰 경우, 앞에서부터 days * 5 개만 남깁니다.
            parsedPlan.spots = parsedPlan.spots.slice(0, days * 5);
        }
        const locationsPromises = parsedPlan.spots.map(spot => Kakao.getLatLng(spot.name));
        const locations = await Promise.all(locationsPromises);
        const validLocations = locations.map(location => {
            if (!location) {
              console.warn('경고: 위치 정보가 null입니다. 해당 위치는 무시됩니다.');
              return null; 
            }
            return location;
          }).filter(location => location !== null); // null 값을 제거합니다.
        const optimalRoute = await calculateOptimalRoute(validLocations);
        // optimalRouteFind 함수의 로직을 재사용하기 위해 findOptimalRoute 함수를 호출
        const placeRoute = optimalRoute.slice(1);
        const result = {
            spots: placeRoute.map(spot => ({ name: spot.name }))
        };
        console.log(result);
        return res.status(201).json(result);
    }
    catch (err) {
        console.error('Error:', err.message);
        res.status(500).send({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

async function calculateOptimalRoute(spots) {
    const n = spots.length;

    // spots 배열로부터 coordinates 배열 생성
    const coordinates = spots.map(spot => ({
        lat: spot.spots[0].latlng.lat,
        lng: spot.spots[0].latlng.lng
    }));

    // 이동 시간 매트릭스 생성
    const travelTimes = await Kakao.calculateTravelTimes(coordinates);

    // DP 배열 초기화
    const dp = Array.from({ length: n }, () => Array(1 << n).fill(Infinity));
    dp[0][1] = 0; // 시작점에서 시작점으로의 비용은 0

    // 이전 상태 및 비용 저장용 배열 초기화
    const prev = Array.from({ length: n }, () => Array(1 << n).fill(-1));
    // 동적 계획법을 이용해 모든 상태를 계산
    for (let mask = 1; mask < (1 << n); mask++) {
        for (let u = 0; u < n; u++) {
            if (!(mask & (1 << u))) continue; // u가 mask에 포함되어 있지 않으면 skip
            for (let v = 0; v < n; v++) {
                if (mask & (1 << v)) continue; // v가 이미 mask에 포함되어 있으면 skip
                const nextMask = mask | (1 << v);
                const newCost = dp[u][mask] + travelTimes[u][v];
                if (newCost < dp[v][nextMask]) {
                    dp[v][nextMask] = newCost;
                    prev[v][nextMask] = u;
                }
            }
        }
    }
    
    // 최적 경로 찾기
    let minCost = Infinity;
    let end = -1;
    const finalMask = (1 << n) - 1;
    for (let i = 0; i < n; i++) {
        const cost = dp[i][finalMask] + travelTimes[i][0];
        if (cost < minCost) {
            minCost = cost;
            end = i;
        }
    }
    
    // 최적 경로 재구성
    const optimalPath = [];
    let mask = finalMask;
    while (end !== -1) {
        optimalPath.push(spots[end].spots[0]); // spots 배열의 첫 번째 객체를 직접 사용
        const temp = end;
        end = prev[end][mask];
        mask = mask ^ (1 << temp);
    }
    optimalPath.push(spots[0].spots[0]); // spots 배열의 첫 번째 객체를 직접 사용
    optimalPath.reverse();

    return optimalPath;
}


exports.getSchedule = async (req, res) => {
    const { startDate, duration, location, companion, routes, days } = req.body;
    try {
        // 새로운 route 배열을 생성합니다. 각 요소는 각 날짜에 해당하는 방문 장소를 저장합니다.
        let newRoutes = [];
        let plans = [];
        console.log(routes);
        const spotsPerDay = Math.ceil(routes.length / days); // 올림을 사용하여 모든 장소를 포함시킵니다.
        for (let day = 0; day < days; day++) {
            const start = day * spotsPerDay;
            const end = start + spotsPerDay;
            const dailyRoutes = routes.slice(start, end).map(route => route.name); // name 속성 추출
            newRoutes.push({ day: day + 1, spots: dailyRoutes });
        }
        for(let day = 0; day < days; day++){
            const placeRoute = newRoutes[day].spots.join(' -> '); 
            const userMessage = `'${startDate}'부터 '${duration}'로 '${location}'지역에 '${companion}'와(과) 함께 여행을 갈거야. 이 여행 중 '${day+1}'일차에 ${placeRoute} 이 여행지를 순서대로 여행할 계획입니다. 이 당일에 관광지마다구체적인 계획을 세워주세요.그리고 각 관광지마다 꼭 간략한 특징과 설명을 옆에 같이 말해주세요.`; 
            const userMSG = await Naver.writeExactTourScheduleFromClova(userMessage);
            if (!userMSG) {
                return res.status(400).json({ msg: 'Clova API 응답에서 오류 발생' });
            }
            const plan = await OpenAi.parsingExactScheduleFromGpt(userMSG);
            plans.push(plan);
        }
        const result = {
            spots: plans.flat() // plans 배열의 모든 항목을 하나의 배열로 평탄화
        };
        const scheduleData = result.spots;
        const data = JSON.stringify(scheduleData);
        console.log(data);
        return res.status(200).json(data); // 수정된 형식으로 응답
    }    
    catch (err) {
        console.error('Error:', err.message);
        res.status(500).send({ success: false, message: '서버 오류가 발생했습니다.' });
    }
}

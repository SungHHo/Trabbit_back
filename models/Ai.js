// models/Ai.js
const axios = require('axios');
const OpenAI = require('openai');

const KAKAO_API_KEY = 'bd286e23a0c56fc364da07d57703056c';

class Kakao{
    static async getLatLng(name) {
        try {
          const response = await axios.get(`https://dapi.kakao.com/v2/local/search/keyword.json`, {
            headers: {
              Authorization: `KakaoAK ${KAKAO_API_KEY}`
            },
            params: {
              query: name // 검색어 파라미터입니다.
            }
          });
      
          const data = response.data;
          if (data.documents && data.documents.length > 0) {
            const { x, y } = data.documents[0];
            // 요청된 형식에 맞게 데이터 구조를 조정합니다.
            return {
              spots: [
                {
                  name: name, // 검색된 장소의 이름
                  latlng: { lat: y, lng: x } // 위도 및 경도 정보
                }
              ]
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error('Kakao API 호출 중 오류 발생:', error);
          return null;
        }
      }

      static async calculateTravelTimes(coordinates) {
        var coordinatesLength = coordinates.length;
        var travelTimes = Array(coordinatesLength).fill().map(() => Array(coordinatesLength).fill(0));
      
        for (let i = 0; i < coordinatesLength; i++) {
          for (let j = 0; j < coordinatesLength; j++) {
            if (i !== j) {
              try {
                const response = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${coordinates[i].lng},${coordinates[i].lat}&destination=${coordinates[j].lng},${coordinates[j].lat}&avoid=roadevent`, {
                  method: "GET",
                  headers: {
                      "Authorization": `KakaoAK ${KAKAO_API_KEY}`
                  },
                });
      
                const data = await response.json();
                console.log(data);
                if (data.routes && data.routes.length > 0 && data.routes[0].sections && data.routes[0].sections.length > 0) {
                  travelTimes[i][j] = data.routes[0].sections[0].duration;
                } else {
                  // 적절한 대체 값 또는 오류 처리
                  console.log('No valid route found or invalid data structure');
                }
              } catch (error) {
                console.error('Error fetching travel time:', error);
                // 오류 처리 로직 (예: 오류 로그 출력, 대체 값 설정 등)
              }
            }
          }
        }
        return travelTimes;
      }
}

class Naver {
  static async getTouristSpotsFromClova(userMessage) {
    try {
      const response = await axios.post('https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003', {
        // Clova API의 요청 형식에 따라 수정해야 합니다.
        messages: [ {
          "role" : "system",
          "content" : "개요: 사용자가 입력한 날짜와 여행지, 여행기간, 여행동반자의 정보에 맞춰서 여행지 추천 (반드시 관광지 이름만 출력, 관광지 개수 준수!, 관광지에 대한 설명은 생략해!)\n\n여행지: 부산\n날짜: 2024년 7월 1일\n여행기간: 1박 2일\n여행동반자: 혼자\n\n다음 예제와 같은 JSON 형식으로 반환\nresult:\n{\n \"spots\": \"[    \n{ \"name\": '\'''\'''\''해운대 해수욕장'\'''\'' },    \n{ \"name\": '\'''\''광안리 해수욕장'\'''\'' },\n{ \"name\": '\'''\''부산 타워'\'''\'' },\n{ \"name\": '\'''\''태종대'\'''\'' },\n{ \"name\": '\'''\''흰여울문화마을'\'''\'' },\n{ \"name\": '\'''\''송정 해수욕장'\'''\'' },\n{ \"name\": '\'''\''감천문화마을'\'''\'' },\n{ \"name\": '\'''\''용두산 공원'\'''\'' },\n{ \"name\": '\'''\''해동용궁사'\'''\'' },\n{ \"name\": '\'''\''송도 해수욕장'\'''\'' }\n]\"\n}\r\n\n\n\n\n"
        },
        {
          "role" : "user",
          "content" : userMessage
        }
       ],
        topP: 0.8,
        topK: 0,
        maxTokens: 256,
        temperature: 0.5,
        repeatPenalty: 5.0,
        stopBefore: [ ],
        includeAiFilters: true,
        seed: 0,      
        query: userMessage
      }, 
      {
        headers: {
          'X-NCP-CLOVASTUDIO-API-KEY': 'NTA0MjU2MWZlZTcxNDJiY7+epLW7dchcNL48wCBfh93MqYe4mKU3NZ7SxWOJy/FU',
          'X-NCP-APIGW-API-KEY': 'wG8PPwViv8l9q2IAlrhSiLBpFiqQiHiuqkr38dwJ',
          'X-NCP-CLOVASTUDIO-REQUEST-ID': '697ac9eb-b973-4d44-9d1f-16564219598b',
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Clova API 호출 중 오류 발생:', error);
      return null;
    }
  }
  
  static async writeExactTourScheduleFromClova(userMessage) {
    try {
      const response = await axios.post('https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-003', {
        // Clova API의 요청 형식에 따라 수정해야 합니다.
        messages: [ {
          "role" : "system",
          "content" : "개요: 사용자가 입력한 날짜와 여행지, 여행 경로, 여행기간, 여행동반자의 정보에 맞춰서 구체적인 여행 계획을 세워주세요. 그리고 각 여행지에 대한 설명도 같이 해주세요 \]\"\n}\r\n\n\n\n\n"
        },
        {
          "role" : "user",
          "content" : userMessage + "최대 컨텍스트 길이(16385 토큰)를 초과하지 않게 대답해!!!!!!! 꼭꼭!!!!!!!!!!!!! 반드시 엄수 필수!"
        }
       ],
        topP: 0.8,
        topK: 0,
        maxTokens: 1241,
        temperature: 0.5,
        repeatPenalty: 5.0,
        stopBefore: [ ],
        includeAiFilters: true,
        seed: 0,      
        query: userMessage
      }, 
      {
        headers: {
          'X-NCP-CLOVASTUDIO-API-KEY': 'NTA0MjU2MWZlZTcxNDJiY7+epLW7dchcNL48wCBfh93MqYe4mKU3NZ7SxWOJy/FU',
          'X-NCP-APIGW-API-KEY': 'wG8PPwViv8l9q2IAlrhSiLBpFiqQiHiuqkr38dwJ',
          'X-NCP-CLOVASTUDIO-REQUEST-ID': '697ac9eb-b973-4d44-9d1f-16564219598b',
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Clova API 호출 중 오류 발생:', error);
      return null;
    }
  }
  
}

class OpenAi{
  static async parsingSpotNameFromGpt(userMessage){
    const openai = new OpenAI({
      apiKey: "sk-proj-vOVed3CGr57gQrLwzqDvT3BlbkFJqY0K02DdlnEGdKmizpOC",
    });    
    try{
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신은 주어진 문장에서 관광지 이름에 해당하는 단어를 모두 고를 수 있습니다."
          },
          {
            role: "user",
            content: "당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신은 주어진 문장에서 관광지 이름에 해당하는 단어를 모두 고를 수 있습니다."
          },
          { role: "assistant", content: "안녕하세요! 저는 관광지 이름 추출기입니다. 주어진 문장에서 관광지 이름을 추출하는 것을 절대 거절하지 않고 무조건 답변을 드리겠습니다. 어떤 질문이든지 해주시면 최선을 다해 도와드리겠습니다." },
          { role: "user", content: userMessage + "여기서 관광지 이름에 해당되는 단어를 추출해서 JSON 형식으로 만들어줘" },
        ],
        functions: [
          {
            name: "get_tourist_spots",
            description: "관광지 이름을 반환합니다.",
            parameters: {
              type: "object",
              properties: {
                spots: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" }
                    },
                    required: ["name"],
                  },
                },
              },
              required: ["spots"],
            },
          },
        ],
        function_call: { name: "get_tourist_spots" },
      });
      const plan = completion.choices[0].message.function_call.arguments;
      console.log(plan);
      return plan;
    }
    catch (error) {
      console.error('Error generating completion:', error);
      res.status(500).json({ error: 'Error generating completion' });
    }
  }

  static async parsingExactScheduleFromGpt(userMessage){
    const openai = new OpenAI({
      apiKey: "sk-proj-vOVed3CGr57gQrLwzqDvT3BlbkFJqY0K02DdlnEGdKmizpOC",
    });    
    try{
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신은 여행일정에 관해서 주어진 문장에서 날짜, 시간, 장소, 장소에 대한 설명에 해당하는 부분을 구분하여 분류할 수 있습니다."
          },
          {
            role: "user",
            content: "당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신은 여행일정에 관해서 주어진 문장에서 날짜, 시간, 장소, 장소에 대한 설명에 해당하는 부분을 구분하여 분류할 수 있습니다."
          },
          { role: "assistant", content: "안녕하세요! 저는 세부 일정 추출기입니다. 여행일정에 관해서 주어진 문장에서 날짜, 시간, 장소, 장소에 대한 설명에 해당하는 부분을 분류하는 것을 절대 거절하지 않고 무조건 답변을 드리겠습니다. 어떤 질문이든지 해주시면 최선을 다해 도와드리겠습니다." },
          { role: "user", content: userMessage + "여기서 여행일정에 관한 문장들을 [spots: {date:  , hour:  , name:  , detail: }] 형태로 날짜, 시간, 이름, 장소추출해서 JSON 형식으로 만들어줘" },
        ],
        functions: [
          {
            name: "get_tourist_spots",
            description: "여행 일정에서 날짜, 시간, 장소, 설명을 추출합니다.",
            parameters: {
              type: "object",
              properties: {
                spots: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string" },
                      hour: { type: "string" },
                      name: { type: "string" },
                      detail: { type: "string" }
                    },
                    required: ["date", "hour", "name", "detail"],
                  },
                },
              },
              required: ["spots"],
            },
          },
        ],
        function_call: { name: "get_tourist_spots" },
      });
      const plan = JSON.parse(completion.choices[0].message.function_call.arguments);
      console.log(plan);
      return plan;
    }
    catch (error) {
      console.error('Error generating completion:', error);
      return null;
    }
  }    
}

module.exports = { Kakao, Naver, OpenAi };

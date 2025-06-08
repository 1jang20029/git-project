// Node.js 백엔드 서버 코드 (server.js)
const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = 'ud4n9otj1x';
const CLIENT_SECRET = 'wwJtgkpaB5K58ghahCTq6gsFADgfanL2DDinxgJ8';

app.use(express.json());
app.use(express.static('public')); // HTML/CSS/JS 파일들

// 대량 API 호출 엔드포인트
app.post('/api/force-usage', async (req, res) => {
  console.log('🚀 대량 API 호출 시작...');
  
  const results = {
    staticMap: 0,
    geocoding: 0,
    reverseGeocoding: 0,
    directions: 0,
    errors: []
  };

  try {
    // 1. Static Map API 대량 호출
    console.log('📍 Static Map API 호출 중...');
    for (let i = 0; i < 100; i++) {
      try {
        const lat = 37.396 + (Math.random() - 0.5) * 0.1;
        const lng = 126.907 + (Math.random() - 0.5) * 0.1;
        
        const response = await axios.get(`https://naveropenapi.apigw.ntruss.com/map-static/v2/raster`, {
          params: {
            w: 300 + (i % 10) * 50,
            h: 200 + (i % 8) * 30,
            center: `${lng},${lat}`,
            level: 14 + (i % 8),
            format: 'png',
            scale: 2,
            markers: `type:t|size:mid|pos:${lng} ${lat}`
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
            'X-NCP-APIGW-API-KEY': CLIENT_SECRET
          },
          responseType: 'arraybuffer'
        });
        
        results.staticMap++;
        console.log(`Static Map ${i}: ${response.status} (${response.data.length} bytes)`);
        
        // 과부하 방지
        if (i % 10 === 0) await sleep(100);
        
      } catch (error) {
        results.errors.push(`Static Map ${i}: ${error.message}`);
      }
    }

    // 2. Geocoding API 호출
    console.log('🔍 Geocoding API 호출 중...');
    const addresses = [
      '서울특별시 중구 세종대로 110',
      '경기도 성남시 분당구 판교역로 235',
      '서울특별시 강남구 테헤란로 152',
      '경기도 수원시 영통구 월드컵로 206',
      '서울특별시 서초구 반포대로 58',
      '경기도 안양시 만안구 성결대학로 53',
      '서울특별시 종로구 종로 1',
      '경기도 고양시 일산동구 중앙로 1104',
      '서울특별시 마포구 홍익로 39',
      '경기도 부천시 길주로 210'
    ];

    for (let i = 0; i < 50; i++) {
      try {
        const address = addresses[i % addresses.length] + ` ${Math.floor(i/5) + 1}번길`;
        
        const response = await axios.get(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode`, {
          params: {
            query: address
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
            'X-NCP-APIGW-API-KEY': CLIENT_SECRET
          }
        });
        
        results.geocoding++;
        console.log(`Geocoding ${i}: ${address} -> ${response.status}`);
        
        await sleep(100);
        
      } catch (error) {
        results.errors.push(`Geocoding ${i}: ${error.message}`);
      }
    }

    // 3. Reverse Geocoding API 호출
    console.log('📍 Reverse Geocoding API 호출 중...');
    for (let i = 0; i < 50; i++) {
      try {
        const lat = 37.396 + (Math.random() - 0.5) * 0.1;
        const lng = 126.907 + (Math.random() - 0.5) * 0.1;
        
        const response = await axios.get(`https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc`, {
          params: {
            coords: `${lng},${lat}`,
            output: 'json'
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
            'X-NCP-APIGW-API-KEY': CLIENT_SECRET
          }
        });
        
        results.reverseGeocoding++;
        console.log(`Reverse Geocoding ${i}: ${lat}, ${lng} -> ${response.status}`);
        
        await sleep(100);
        
      } catch (error) {
        results.errors.push(`Reverse Geocoding ${i}: ${error.message}`);
      }
    }

    // 4. Directions API 호출
    console.log('🛣️ Directions API 호출 중...');
    const routes = [
      { start: '126.9070,37.3963', goal: '126.9100,37.4000' },
      { start: '126.9080,37.3950', goal: '126.9050,37.3980' },
      { start: '126.9060,37.3970', goal: '126.9090,37.3940' },
      { start: '126.9040,37.3930', goal: '126.9110,37.3990' },
      { start: '126.9030,37.3960', goal: '126.9120,37.3920' }
    ];

    for (let i = 0; i < routes.length; i++) {
      try {
        const route = routes[i];
        
        const response = await axios.get(`https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving`, {
          params: {
            start: route.start,
            goal: route.goal,
            option: 'trafast'
          },
          headers: {
            'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
            'X-NCP-APIGW-API-KEY': CLIENT_SECRET
          }
        });
        
        results.directions++;
        console.log(`Directions ${i}: ${route.start} -> ${route.goal} = ${response.status}`);
        
        await sleep(200);
        
      } catch (error) {
        results.errors.push(`Directions ${i}: ${error.message}`);
      }
    }

    console.log('✅ 대량 API 호출 완료');
    console.log('결과:', results);

    res.json({
      success: true,
      message: '대량 API 호출 완료',
      results: results,
      totalCalls: results.staticMap + results.geocoding + results.reverseGeocoding + results.directions
    });

  } catch (error) {
    console.error('API 호출 중 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results: results
    });
  }
});

// 지속적인 API 호출 (1분마다)
setInterval(async () => {
  console.log('⏰ 정기 API 호출 시작...');
  
  try {
    // Static Map 5회
    for (let i = 0; i < 5; i++) {
      const lat = 37.396 + (Math.random() - 0.5) * 0.05;
      const lng = 126.907 + (Math.random() - 0.5) * 0.05;
      
      await axios.get(`https://naveropenapi.apigw.ntruss.com/map-static/v2/raster`, {
        params: {
          w: 200, h: 150, center: `${lng},${lat}`, level: 16
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
          'X-NCP-APIGW-API-KEY': CLIENT_SECRET
        },
        responseType: 'arraybuffer'
      });
      
      await sleep(100);
    }
    
    console.log('⏰ 정기 API 호출 완료');
  } catch (error) {
    console.error('정기 API 호출 오류:', error.message);
  }
}, 60000); // 1분마다

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.listen(3000, () => {
  console.log('🚀 서버가 3000번 포트에서 실행 중...');
  console.log('http://localhost:3000');
});

// 프론트엔드에서 호출할 수 있는 함수
// fetch('/api/force-usage', { method: 'POST' })
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    fixed_load: {
      executor: 'constant-arrival-rate',
      rate: 350,              // Cố định đúng 350 request / giây
      timeUnit: '1s',
      duration: '20s',         // Cố định chạy trong đúng 20 giây -> Tổng 7,000 requests
      preAllocatedVUs: 150,
      maxVUs: 400,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Cho phép lỗi tối đa 5%
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://loadbalancer:80';

export default function () {
  // Bắn vào 1 endpoint duy nhất của Frontend Microservice
  const res = http.get(`${BASE_URL}/`, {
    timeout: '1500ms', // Timeout 1.5s: nếu nghẽn hàng đợi quá 1.5s tính là thất bại (Drop/Fail)
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}

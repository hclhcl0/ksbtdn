import cron from 'node-cron';
import { prisma } from './prisma';

let isCronStarted = false;

export function initCron() {
  if (isCronStarted) return;
  // Để dễ test, chúng ta cho phép chạy trên cả môi trường Dev nếu muốn. 
  // Tuy nhiên trong Next.js Dev, cron có thể bị duplicate nếu hot reload. 
  // Biến isCronStarted sẽ hạn chế phần nào.
  isCronStarted = true;
  console.log("⏰ [Zalo Auto Cron] Khởi chạy bộ đếm giờ ngầm (chạy mỗi phút)...");

  // Chạy mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      // 1. Lấy cài đặt từ DB
      const settings = await prisma.systemSetting.findMany({
        where: {
          key: { in: ['zalo_cron_enabled', 'zalo_cron_time', 'zalo_cron_last_run'] }
        }
      });
      
      let enabled = false;
      let timeStr = "";
      let lastRun = "";

      settings.forEach(s => {
        if (s.key === 'zalo_cron_enabled') enabled = (s.value === 'true');
        if (s.key === 'zalo_cron_time') timeStr = s.value;
        if (s.key === 'zalo_cron_last_run') lastRun = s.value;
      });

      if (!enabled || !timeStr) return;

      // 2. Lấy giờ Việt Nam hiện tại
      const now = new Date();
      const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const currentH = vnTime.getHours().toString().padStart(2, '0');
      const currentM = vnTime.getMinutes().toString().padStart(2, '0');
      const currentHM = `${currentH}:${currentM}`;

      const todayDate = vnTime.toISOString().split('T')[0]; // YYYY-MM-DD

      if (currentHM === timeStr && lastRun !== todayDate) {
        console.log(`⏰ [Zalo Auto Cron] Đã đến giờ gửi hẹn (${timeStr}). Bắt đầu kích hoạt gửi gom bài...`);

        // Cập nhật last run ngay lập tức để tránh trùng lặp
        await prisma.systemSetting.upsert({
          where: { key: 'zalo_cron_last_run' },
          update: { value: todayDate, label: 'zalo_cron_last_run' },
          create: { key: 'zalo_cron_last_run', value: todayDate, label: 'zalo_cron_last_run' },
        });

        // Kích hoạt API gửi nội bộ
        const secret = process.env.CRON_SECRET || "zalo-cdc-cron-secret-123";
        const url = `http://127.0.0.1:${process.env.PORT || 3000}/api/zalo-admin/cron-broadcast?secret=${secret}`;
        
        fetch(url)
          .then(res => res.json())
          .then(data => {
            console.log("⏰ [Zalo Auto Cron] Kết quả trả về:", data);
          })
          .catch(err => {
            console.error("⏰ [Zalo Auto Cron] Lỗi kết nối API cục bộ:", err);
          });
      }
    } catch (err) {
      console.error("⏰ [Zalo Auto Cron] Lỗi:", err);
    }
  });
}

const PREDEFINED_GENRES = [
  { name: 'Tiên Hiệp', slug: 'tien-hiep', icon: 'i-lucide-sword', description: 'Tu luyện, phi thăng, khám phá đại đạo.' },
  { name: 'Huyền Huyễn', slug: 'huyen-huyen', icon: 'i-lucide-sparkles', description: 'Thế giới kỳ ảo, ma pháp, dị năng.' },
  { name: 'Đô Thị', slug: 'do-thi', icon: 'i-lucide-building-2', description: 'Câu chuyện diễn ra ở bối cảnh hiện đại.' },
  { name: 'Hệ Thống', slug: 'he-thong', icon: 'i-lucide-laptop', description: 'Nhân vật chính có sự trợ giúp của một hệ thống.' },
  { name: 'Khoa Huyễn', slug: 'khoa-huyen', icon: 'i-lucide-rocket', description: 'Viễn tưởng, công nghệ tương lai, vũ trụ.' },
  { name: 'Võng Du', slug: 'vong-du', icon: 'i-lucide-gamepad-2', description: 'Nhân vật phiêu lưu trong thế giới game ảo.' },
  { name: 'Lịch Sử', slug: 'lich-su', icon: 'i-lucide-scroll', description: 'Dựa trên hoặc lấy cảm hứng từ các sự kiện lịch sử.' },
  { name: 'Trọng Sinh', slug: 'trong-sinh', icon: 'i-lucide-refresh-cw', description: 'Sống lại một lần nữa để thay đổi quá khứ.' },
  { name: 'Xuyên Không', slug: 'xuyen-khong', icon: 'i-lucide-plane-takeoff', description: 'Du hành đến một thế giới hoặc thời đại khác.' },
  { name: 'Dị Năng', slug: 'di-nang', icon: 'i-lucide-zap', description: 'Sở hữu những năng lực siêu nhiên đặc biệt.' },
  { name: 'Dị Giới', slug: 'di-gioi', icon: 'i-lucide-globe', description: 'Khám phá những thế giới hoàn toàn xa lạ.' },
  { name: 'Hài Hước', slug: 'hai-huoc', icon: 'i-lucide-laugh', description: 'Tình tiết vui vẻ, mang lại tiếng cười.' },
  { name: 'Tình Cảm', slug: 'tinh-cam', icon: 'i-lucide-heart', description: 'Tập trung vào các mối quan hệ lãng mạn.' },
  { name: 'Ngôn Tình', slug: 'ngon-tinh', icon: 'i-lucide-book-heart', description: 'Tiểu thuyết lãng mạn dành cho nữ giới.' },
  { name: 'Trinh Thám', slug: 'trinh-tham', icon: 'i-lucide-search', description: 'Điều tra, phá giải các vụ án bí ẩn.' },
  { name: 'Kinh Dị', slug: 'kinh-di', icon: 'i-lucide-ghost', description: 'Yếu tố rùng rợn, ma quái, gây sợ hãi.' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong', icon: 'i-lucide-bot', description: 'Những ý tưởng vượt ra ngoài thực tại.' },
  { name: 'Thanh Xuân', slug: 'thanh-xuan', icon: 'i-lucide-school-2', description: 'Câu chuyện về tuổi trẻ, học đường.' },
  { name: 'Thám Hiểm', slug: 'tham-hiem', icon: 'i-lucide-compass', description: 'Những cuộc phiêu lưu đến vùng đất mới.' },
  { name: 'Chiến Tranh', slug: 'chien-tranh', icon: 'i-lucide-swords', description: 'Bối cảnh quân sự, các trận chiến quy mô lớn.' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu', icon: 'i-lucide-map', description: 'Những cuộc hành trình đầy thử thách.' },
  { name: 'Âm Nhạc', slug: 'am-nhac', icon: 'i-lucide-music', description: 'Xoay quanh cuộc sống của các nghệ sĩ.' },
  { name: 'Thể Thao', slug: 'the-thao', icon: 'i-lucide-trophy', description: 'Theo đuổi đam mê và vinh quang thể thao.' },
  { name: 'Giáo Dục', slug: 'giao-duc', icon: 'i-lucide-graduation-cap', description: 'Mang ý nghĩa nhân văn, truyền tải bài học.' },
  { name: 'Tâm Lý', slug: 'tam-ly', icon: 'i-lucide-brain-circuit', description: 'Khám phá sâu vào nội tâm, suy nghĩ nhân vật.' },
  { name: 'Gia Đình', slug: 'gia-dinh', icon: 'i-lucide-home', description: 'Các mối quan hệ và xung đột trong gia đình.' },
  { name: 'Cổ Đại', slug: 'co-dai', icon: 'i-lucide-castle', description: 'Bối cảnh thời kỳ cổ xưa, phong kiến.' },
  { name: 'Hiện Đại', slug: 'hien-dai', icon: 'i-lucide-smartphone', description: 'Câu chuyện xảy ra trong thời đại ngày nay.' },
  { name: 'Tương Lai', slug: 'tuong-lai', icon: 'i-lucide-space-ship', description: 'Bối cảnh ở một tương lai xa xôi.' },
  { name: 'Siêu Nhiên', slug: 'sieu-nhien', icon: 'i-lucide-wand-2', description: 'Các hiện tượng không thể giải thích bằng khoa học.' }
]

export default defineNitroPlugin(async () => {
  try {
    const count = await Genre.countDocuments()
    if (count === 0) {
      console.log('🌱 Seeding genres...')
      await Genre.insertMany(PREDEFINED_GENRES)
      console.log('✅ Genres seeded successfully.')
    }
  } catch (error) {
    console.error('Error seeding genres:', error)
  }
})

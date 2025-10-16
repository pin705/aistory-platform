export function slugify(
  text: string,
  options?: {
    replacement?: string // Ký tự thay thế, mặc định là '-'
    customReplacements?: [string | RegExp, string][] // Thêm các quy tắc thay thế riêng
  }
): string {
  // --- (MỚI) Thiết lập các tùy chọn với giá trị mặc định ---
  const replacement = options?.replacement || '-'
  const customReplacements = options?.customReplacements || []

  let slug = text.toString()

  // --- (MỚI) Xử lý ký tự "đ" và "Đ" một cách tường minh ---
  // Đảm bảo "đ" luôn chuyển thành "d"
  slug = slug.replace(/đ/g, 'd').replace(/Đ/g, 'D')

  // --- (MỚI) Áp dụng các quy tắc thay thế tùy chỉnh ---
  for (const [pattern, replacementStr] of customReplacements) {
    slug = slug.replace(pattern, replacementStr)
  }

  slug = slug
    .normalize('NFD') // Chuẩn hóa Unicode để tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu thanh, dấu mũ...
    .toLowerCase()
    .trim()
    .replace(/\s+/g, replacement) // Thay khoảng trắng bằng ký tự thay thế
    .replace(/[^\w\-._~]+/g, '') // Loại bỏ ký tự đặc biệt, nhưng giữ lại các ký tự an toàn cho URL (-, _, ., ~)
    .replace(new RegExp(`\\${replacement}+`, 'g'), replacement) // Thay nhiều ký tự thay thế liền nhau bằng 1
    .replace(new RegExp(`^\\${replacement}+|\\${replacement}+$`, 'g'), '') // (MỚI) Loại bỏ ký tự thay thế ở đầu và cuối chuỗi

  return slug
}

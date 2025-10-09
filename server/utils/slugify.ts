export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
    .replace(/[^\w-]+/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/--+/g, '-') // Thay nhiều -- bằng 1 -
}

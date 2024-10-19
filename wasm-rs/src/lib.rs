use wasm_bindgen::prelude::*;

// Гауссово ядро 15x15
const KERNEL: [[i32; 15]; 15] = [
    [2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 2],
    [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
    [5, 10, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 10, 10, 5],
    [5, 10, 13, 16, 16, 16, 16, 16, 16, 16, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 20, 20, 20, 20, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 26, 26, 26, 26, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 26, 32, 32, 26, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 26, 32, 32, 26, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 26, 26, 26, 26, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 20, 20, 20, 20, 20, 20, 16, 13, 10, 10, 5],
    [5, 10, 13, 16, 16, 16, 16, 16, 16, 16, 16, 13, 10, 10, 5],
    [5, 10, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 10, 10, 5],
    [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
    [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
    [2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 2],
];

const KERNEL_SUM: i32 = 2684; // Сумма всех элементов ядра

// Функция для инвертирования цветов изображения
#[wasm_bindgen]
pub fn invert_colors(pixels: &mut [u8]) {
    let len = pixels.len();
    for i in (0..len).step_by(4) {
        // Инвертируем только первые три канала (RGB), альфа канал не трогаем
        pixels[i] = 255 - pixels[i];       // R
        pixels[i + 1] = 255 - pixels[i + 1]; // G
        pixels[i + 2] = 255 - pixels[i + 2]; // B
    }
}

// Применение Гауссова размытия к изображению
#[wasm_bindgen]
pub fn apply_gaussian_blur(pixels: &mut [u8], width: usize, height: usize) {
    let kernel_size: usize = 15;
    let half_kernel = kernel_size / 2;

    // Временные данные для хранения результата
    let mut temp_pixels = pixels.to_vec();

    for y in half_kernel..(height - half_kernel) {
        for x in half_kernel..(width - half_kernel) {
            let mut r_sum = 0;
            let mut g_sum = 0;
            let mut b_sum = 0;

            // Применение ядра к пикселям
            for ky in 0..kernel_size {
                for kx in 0..kernel_size {
                    let weight = KERNEL[ky][kx];
                    let px = (x + kx - half_kernel) as usize;
                    let py = (y + ky - half_kernel) as usize;
                    let pixel_index = (py * width + px) * 4;
                    r_sum += pixels[pixel_index] as i32 * weight;
                    g_sum += pixels[pixel_index + 1] as i32 * weight;
                    b_sum += pixels[pixel_index + 2] as i32 * weight;
                }
            }

            // Обновление пикселей в результате
            let index = (y * width + x) * 4;
            temp_pixels[index] = (r_sum / KERNEL_SUM) as u8;
            temp_pixels[index + 1] = (g_sum / KERNEL_SUM) as u8;
            temp_pixels[index + 2] = (b_sum / KERNEL_SUM) as u8;
        }
    }

    // Копируем результат обратно в исходный массив
    pixels.copy_from_slice(&temp_pixels);
}

// Комбинированная функция: сначала размытие, затем инвертирование цветов
#[wasm_bindgen]
pub fn blur_and_invert(pixels: &mut [u8], width: usize, height: usize) {
    // Применяем инвертирование цветов
    invert_colors(pixels);

    // Применяем размытие
    apply_gaussian_blur(pixels, width, height);
}

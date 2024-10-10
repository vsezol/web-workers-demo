(module
  ;; определение памяти, инициализируем одной страницей (64КБ)
  (memory $memory 1)

  ;; экспорт памяти для доступа из JavaScript или других окружений
  (export "memory" (memory $memory))

  (func $growMemory (param $pages i32) (result i32)
    ;; увеличиваем память на указанное количество страниц
    (memory.grow (local.get $pages))
  )
  (export "growMemory" (func $growMemory))

  (func $invertColors (param $size i32)
    (local $i i32)
    (local $j i32)

    (local.set $i (i32.const 0))

    ;; пробегаемся по всем пикселям
    (loop $loop
      (local.set $j (i32.const 0))
      ;; пробегаемся по байтам пискеля
      
      (loop $for
        ;; инвертируем байт
        (i32.add (local.get $i) (local.get $j))
        call $invertByteByOffset
        ;; увеличивем индекс
        (local.set $j (i32.add (local.get $j) (i32.const 1)))
        ;; пока индекс меньше 3
        (br_if $for (i32.lt_s (local.get $j) (i32.const 3)))
      )

      ;; увеличиваем смещение на 4 байта (переход к следующему пикселю)
      (local.set $i (i32.add (local.get $i) (i32.const 4)))

      ;; пока не прошли по всем пикселям
      (br_if $loop (i32.lt_s (local.get $i) (local.get $size)))
    )
  )
  (export "invertColors" (func $invertColors))

  (func $invertByteByOffset (param $offset i32)
    local.get $offset
    (call $invertByte (i32.load (local.get $offset)))
    i32.store8
  )

  (func $invertByte (param $val i32) (result i32)
    i32.const 255
    local.get $val
    i32.sub
  )
)

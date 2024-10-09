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

    i32.const 0
    local.set $i

    ;; пробегаемся по всем пикселям
    (loop $loop

      local.get $i
      i32.const 255
      local.get $i
      i32.load
      i32.sub
      i32.store8
      
      i32.const 1
      local.get $i
      i32.add
      i32.const 255
      i32.const 1
      local.get $i
      i32.add
      i32.load
      i32.sub
      i32.store8

      i32.const 2
      local.get $i
      i32.add
      i32.const 255
      i32.const 2
      local.get $i
      i32.add
      i32.load
      i32.sub
      i32.store8

      ;; увеличиваем смещение на 4 байта (переход к следующему пикселю)
      i32.const 4
      local.get $i
      i32.add
      local.set $i

      ;; пока не прошли по всем пикселям
      local.get $i
      local.get $size
      i32.lt_s
      br_if $loop
    )
  )
  (export "invertColors" (func $invertColors))
)

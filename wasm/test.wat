(module
  (func $calc (param $size i64) (result i64)
    (local $i i64)
    (local $result i64)
    
    i64.const 0
    local.set $i
    
    i64.const 0
    local.set $result

    (loop $loop
      local.get $i
      local.get $result
      i64.add
      local.set $result

      i64.const 1
      local.get $i
      i64.add
      local.tee $i
      local.get $size
      i64.lt_s
      br_if $loop
    )

    local.get $result
  )
  (export "calc" (func $calc))
)

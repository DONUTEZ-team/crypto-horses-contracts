function bet(
  const params          : fulfill_t;
  const s               : storage_t)
                        : return_t is
  block {
    const ops : list(operation) = list [
      get_fulfill_op(params, s.ubinetic)
    ];
  } with (ops, s)

function packBytes(
  const param           : address;
  var s                 : storage_t)
                        : return_t is
  block {
    s.pBytes := Bytes.pack(param);
  } with ((nil : list(operation)), s)

function default(
  const s               : storage_t)
                        : return_t is
  block {
    skip;
  } with ((nil : list(operation)), s)

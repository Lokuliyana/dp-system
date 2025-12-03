exports.ok = (data) => ({ ok: true, data })
exports.created = (data) => ({ ok: true, data })
exports.paginated = (items, meta) => ({ ok: true, items, meta })

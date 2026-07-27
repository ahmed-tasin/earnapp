const normalizePhone = (value) => {
  let phone = String(value || "")
    .trim()
    .replace(/[\s-]/g, "");

  if (phone.startsWith("+880")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("880")) {
    phone = `0${phone.slice(3)}`;
  }

  return phone;
};

normalizePhone.variants = (value) => {
  const phone = normalizePhone(value);

  if (!/^01[3-9]\d{8}$/.test(phone)) {
    return [phone];
  }

  return [
    phone,
    `880${phone.slice(1)}`,
    `+880${phone.slice(1)}`,
  ];
};

module.exports = normalizePhone;
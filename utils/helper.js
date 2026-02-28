// 📌 Standard Success Response
export const successResponse = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};


// 📌 Standard Error Response
export const errorResponse = (res, message = "Something went wrong", statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};


// 📌 Email Validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


// 📌 Password Strength Validation
// Minimum 6 characters, at least 1 letter and 1 number
export const validatePassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return regex.test(password);
};


// 📌 Calculate Difference in Days
export const getDaysDifference = (date) => {
  const today = new Date();
  const target = new Date(date);

  const diffTime = target - today;
  return  Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
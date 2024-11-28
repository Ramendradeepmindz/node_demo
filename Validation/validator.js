import validator from "validator";

const validationAll  = {
    validateName(name) {
        if (!name || name.trim().length < 2) {
            return "Name must be at least 2 characters long.";
        }
        return null;
    },

    validateEmail(email) {
        if (!email || !validator.isEmail(email)) {
            return "Invalid email format.";
        }
        return null;
    },

    validatePassword(password) {
        if (!password || password.length < 6) {
            return "Password must be at least 6 characters long.";
        }
        return null;
    },

    validatePhoneNo(phoneNo) {
        if (!phoneNo || !validator.isMobilePhone(phoneNo, 'any')) {
            return "Invalid phone number.";
        }
        return null;
    }
};
export default validationAll

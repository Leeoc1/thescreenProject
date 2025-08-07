// 아이디 6~12자 확인
export const validateUsernameLength = (userid) => {
    return userid.length >= 6 && userid.length <= 12;
}

// 아이디 영어, 숫자, 기호만 가능 + 영어 반드시 하나 이상
export const validateUsernameFormat = (userid) => {
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]+$/;  
    return usernameRegex.test(userid);
}

// 비밀번호 8~20자 
export const validatePasswordLength = (password) => {
    return password.length >= 8 && password.length <= 20;
}

// 비밀번호 숫자, 특수문자, 영문자 모두 들어있어야함 
export const validatePasswordStrength = (password) => {
    // /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ 특수기호 범위 어떻게? << 얘도 있음 

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_,.?":{}|<>])[a-zA-Z0-9!@#$%^&*()_,.?":{}|<>]+$/;

    return passwordRegex.test(password);
}


export const ValidationUtils = {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPhone(phone) {
        const re = /^\+?[\d\s-]{10,}$/;
        return re.test(phone);
    },

    isValidResumeFile(file) {
        if (!file) return { valid: false, message: 'File is required' };
        
        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            return { valid: false, message: 'File must be less than 5MB' };
        }

        const validTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!validTypes.includes(file.type)) {
            return { valid: false, message: 'Only PDF, DOC, and DOCX files are allowed' };
        }

        return { valid: true };
    },

    validateJobForm(data) {
        const required = ['title', 'department', 'location', 'experience', 'employment_type', 'status'];
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                return { valid: false, message: `${field} is required` };
            }
        }
        return { valid: true };
    }
};

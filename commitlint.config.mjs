export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'subject-case': [0], // Allow any case (e.g. Sentence case from IDE)
        'subject-full-stop': [0], // Allow periods at the end
    },
};

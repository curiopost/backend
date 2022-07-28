const cleanUsernameRegex = new RegExp("^[A-Za-z0-9._~()'!*:@,;+?-]*$", 'i')

function validateUsername(username) {

    if(!username) {
        throw `Username is required.`
    }

    if(typeof username !== "string") {
        throw `Username must be a string.`
    
    }

    return cleanUsernameRegex.test(username)
}

module.exports = validateUsername;
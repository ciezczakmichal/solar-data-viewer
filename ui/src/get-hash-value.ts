// na podstawie https://stackoverflow.com/a/11920807
export function getHashValue(key: string): string {
    key = key.toLowerCase()

    const keyAndHash = location.hash
        .toLowerCase()
        .match(new RegExp(key + '=([^&]*)'))
    let value = ''

    if (keyAndHash) {
        value = keyAndHash[1]
    }

    return value
}

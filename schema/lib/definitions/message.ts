export enum MessageType {
    Info = 'info',
}

export interface Message {
    type: MessageType
    text: string
    url?: string
}

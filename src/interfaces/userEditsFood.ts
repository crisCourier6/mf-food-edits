import { FoodExternal } from "./foodExternal"
export interface UserEditsFood{
    id: string
    idFood?: string
    idUser?: string
    idJudge?: string
    type?: string
    state?: string
    createdAt: Date
    judgedAt: Date
    rejectReason?: string
    imagesFolder?: string
    foodData?: FoodExternal
}
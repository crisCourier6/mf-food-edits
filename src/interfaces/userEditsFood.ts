import { FoodExternal } from "./foodExternal"
import { FoodLocal } from "./foodLocal"
import { User } from "./User"
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
    foodLocal?: FoodLocal
    user?:User
}
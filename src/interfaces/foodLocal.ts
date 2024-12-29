import { FoodExternal } from "./foodExternal"
import { FoodHasAdditive } from "./foodHasAdditive"
import { FoodHasAllergen } from "./foodHasAllergen"

export interface FoodLocal{
    id:string
    name:string
    picture:string
    hasLocalAllergens: boolean
    hasLocalAdditives: boolean
    foodData?:FoodExternal
    foodHasAllergen?:FoodHasAllergen[]
    foodHasAdditive?:FoodHasAdditive[]
}
import { Allergen } from "./allergen"

export interface FoodHasAllergen{
    allergenId:string
    foodLocalId: string
    isAllergen: boolean
    isTrace: boolean
    allergen:Allergen
}
import React, { ChangeEvent } from "react";
import { Button, Box, Alert, Grid, Typography, TextField, Chip, 
    Dialog, DialogTitle, List, ListItem, ListItemText, DialogActions, 
    IconButton, DialogContent, Snackbar, CircularProgress,
    Divider,TableContainer,Paper,Table,TableHead,TableRow,
    TableCell,TableBody,FormControlLabel,Checkbox} from '@mui/material';
import { useNavigate, useParams} from 'react-router-dom';
import api from "../api";
import { useEffect, useState } from 'react';
import { FoodExternal } from "../interfaces/foodExternal";
import { useForm } from "react-hook-form";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import NoPhoto from "../../public/no-photo.png"

type Allergen = { id: string; name: string};
type Additive = { id: string; name: string};
type FormValues = {
    id: string | undefined;
    product_name: string;
    brands: string;
    quantity: string;
    serving_size: string;
    ingredients_text_es: string;
    allergens: string;
    traces: string;
    additives: string;
    nutriment_energy: number|string;
    nutriment_energy_unit: string;
    nutriment_proteins: number|string;
    nutriment_proteins_unit: string;
    nutriment_fat: number|string;
    nutriment_fat_unit: string;
    "nutriment_saturated-fat": number|string;
    "nutriment_saturated-fat_unit": string;
    "nutriment_monounsaturated-fat": number|string;
    "nutriment_monounsaturated-fat_unit": string;
    "nutriment_polyunsaturated-fat": number|string;
    "nutriment_polyunsaturated-fat_unit": string;
    "nutriment_trans-fat": number|string;
    "nutriment_trans-fat_unit": string;
    nutriment_cholesterol: number|string;
    nutriment_cholesterol_unit: string;
    nutriment_carbohydrates: number|string;
    nutriment_carbohydrates_unit: string;
    nutriment_sugars: number|string;
    nutriment_sugars_unit: string;
    nutriment_sodium: number|string;
    nutriment_sodium_unit: string;
    nutrition_data_per: string;
  };

const FoodEdit: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const additivesURL = "/submissions-additives"
    const allergensURL = "/submissions-allergens"
    const foodURL = "/submissions-food"
    const submissionsURL = "/submissions"
    const [foodData, setFoodData] = useState<FoodExternal>()
    const [allergensAll, setAllergensAll] = useState<Allergen[]>([])
    const [allergensTags, setAllergensTags] = useState<Allergen[]>([])
    const [additivesAll, setAdditivesAll] = useState<Additive[]>([])
    const [additivesTags, setAdditivesTags] = useState<Additive[]>([])
    const [tracesTags, setTracesTags] = useState<Allergen[]>([])
    const [filteredAllergens, setFilteredAllergens] = useState<Allergen[]>([]);
    const [filteredTraces, setFilteredTraces] = useState<Allergen[]>([]);
    const [filteredAdditives, setFilteredAdditives] = useState<Additive[]>([]);
    const [searchAdditives, setSearchAdditives] = useState<Additive[]>([])
    const [searchTerm, setSearchTerm] = useState('');
    const [allergensOpen, setAllergensOpen] = useState(false);
    const [tracesOpen, setTracesOpen] = useState(false);
    const [additivesOpen, setAdditivesOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState("")
    const [ingredientsFile, setIngredientsFile] = useState<File | null>(null);
    const [ingredientsPreview, setIngredientsPreview] = useState<string | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [nutritionFile, setNutritionFile] = useState<File | null>(null);
    const [nutritionPreview, setNutritionPreview] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false)
    const [submissionType, setSubmissionType] = useState("edit")
    const [foodOldImages, setFoodOldImages] = useState({front: "", ingredients: "", nutrition: ""})
    const [selectedImage, setSelectedImage] = useState<string|null>(null)
    const [noNutrition, setNoNutrition] = useState(false)
    const [allDone, setAllDone] = useState(false)
    const form = useForm<FormValues>({
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            id: id,
            allergens: "",
            traces: "",
            additives: "",
            nutriment_energy: "",
            nutriment_energy_unit: "kcal",
            nutriment_proteins:"",
            nutriment_proteins_unit: "g",
            nutriment_fat:"",
            nutriment_fat_unit: "g",
            "nutriment_saturated-fat": "",
            "nutriment_saturated-fat_unit": "g",
            "nutriment_monounsaturated-fat": "",
            "nutriment_monounsaturated-fat_unit": "g",
            "nutriment_polyunsaturated-fat": "",
            "nutriment_polyunsaturated-fat_unit": "g",
            "nutriment_trans-fat": "",
            "nutriment_trans-fat_unit": "g",
            nutriment_cholesterol: "",
            nutriment_cholesterol_unit: "mg",
            nutriment_carbohydrates: "",
            nutriment_carbohydrates_unit: "g",
            nutriment_sugars: "",
            nutriment_sugars_unit: "g",
            nutriment_sodium: "",
            nutriment_sodium_unit: "mg",
            nutrition_data_per: "100g"
        }
    })
    const nutrition : Array<{ label: string; field: keyof FormValues }> = [
        { label: "Energía (kcal)", field: "nutriment_energy" },
        { label: "Proteínas (g)", field: "nutriment_proteins" },
        { label: "Grasa total (g)", field: "nutriment_fat" },
        { label: "G. Saturadas (g)", field: "nutriment_saturated-fat" },
        { label: "G. Monoinsat (g).", field: "nutriment_monounsaturated-fat" },
        { label: "G. Poliinsat (g).", field: "nutriment_polyunsaturated-fat" },
        { label: "G. Trans (g)", field: "nutriment_trans-fat" },
        { label: "Colesterol (mg)", field: "nutriment_cholesterol" },
        { label: "H. de C. Disp. (g)", field: "nutriment_carbohydrates" },
        { label: "Azúcares totales (g)", field: "nutriment_sugars" },
        { label: "Sodio (mg)", field: "nutriment_sodium" },
      ]
    const { register, handleSubmit, formState, control, getValues, watch, setValue } = form
    const {errors} = formState    
    type NutrientField = keyof FormValues;

    useEffect(()=>{
        document.title = "Edición de alimento - EyesFood";
        let searchParams = new URLSearchParams(location.search);
        let newFood = searchParams.get("n") || null
        if (newFood){
            setSubmissionType("new")
        }
        api.get(allergensURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(response => {
            setAllergensAll(response.data)
        })
    },[])

    useEffect(()=>{
        api.get(additivesURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(response => {
            setAdditivesAll(response.data)
        })
    },[allergensAll])

    useEffect(()=>{
       api.get(foodURL + "/" + id, {
        withCredentials: true,
        headers: {
            Authorization: "Bearer " + window.localStorage.token
        }
       })
       .then((response)=>{
            let food = response.data.foodData
            setFoodData(food)
            form.reset(food)
            // setValue("id", food.id || "");
            // setValue("product_name", food.product_name || "");
            // setValue("quantity", food.quantity || "");
            // setValue("brands", food.brands || "");
            setValue("ingredients_text_es", food.ingredients_text || "");
            setValue("nutriment_cholesterol_unit", "mg")
            setValue("nutriment_sodium_unit", "mg")
            // setValue("serving_size", food.serving_size || "");
            // setValue("allergens", food.allergens_tags.join(", ") || "")
            // setValue("traces", food.traces_tags.join(", ") || "")
            // setValue("additives", food.additives_tags.join(", ") || "")
            let oldImages = {front: "", ingredients: "", nutrition: ""}
            if(food.selected_images){
                food.selected_images.front?.display
                        ? oldImages.front = food.selected_images.front.display.es
                                            || food.selected_images.front.display.en 
                                            || "noPhoto"
                        : oldImages.front = "noPhoto"
                food.selected_images.ingredients?.display
                        ? oldImages.ingredients = food.selected_images.ingredients.display.es
                                            || food.selected_images.ingredients.display.en 
                                            || "noPhoto"
                        : oldImages.ingredients = "noPhoto"

                food.selected_images.nutrition?.display
                        ? oldImages.nutrition = food.selected_images.nutrition.display.es
                                            || food.selected_images.nutrition.display.en 
                                            || "noPhoto"
                        : oldImages.nutrition = "noPhoto"
            }
            setFoodOldImages(oldImages)

            food.nutriments["energy-kcal_100g"]
                ? setValue("nutriment_energy", food.nutriments["energy-kcal_100g"])
                :null
            food.nutriments.proteins_100g
                ? setValue("nutriment_energy", food.nutriments["energy-kcal_100g"])
                :null
            food.nutriments.fat_100g
                ? setValue("nutriment_energy", food.nutriments["energy-kcal_100g"])
                :null
            food.nutriments["saturated-fat_100g"]
                ? setValue("nutriment_saturated-fat", food.nutriments["saturated-fat_100g"])
                :null
            food.nutriments["monounsaturated-fat_100g"]
                ? setValue("nutriment_monounsaturated-fat", food.nutriments["monounsaturated-fat_100g"])
                :null
            food.nutriments["polyunsaturated-fat_100g"]
                ? setValue("nutriment_polyunsaturated-fat", food.nutriments["polyunsaturated-fat_100g"])
                :null
            food.nutriments["trans-fat_100g"]
                ? setValue("nutriment_trans-fat", food.nutriments["trans-fat_100g"])
                :null
            food.nutriments["cholesterol_value"]
                ? setValue("nutriment_cholesterol", food.nutriments["cholesterol_value"])
                :null
            food.nutriments["carbohydrates_100g"]
                ? setValue("nutriment_carbohydrates", food.nutriments["carbohydrates_100g"])
                :null
            food.nutriments["sugars_100g"]
                ? setValue("nutriment_sugars", food.nutriments["sugars_100g"])
                :null
            food.nutriments["sodium_value"]
                ? setValue("nutriment_sodium", food.nutriments["sodium_value"])
                :null

            const initialAllergensTags = food.allergens_tags?.map((tagId: string) => 
                allergensAll.find(allergen => allergen.id === tagId)
            ).filter(Boolean) as Allergen[]; // Filter out any undefined results

            const initialTracesTags = food.traces_tags?.map((tagId: string) => 
                allergensAll.find(allergen => allergen.id === tagId)
            ).filter(Boolean) as Allergen[]; // Filter out any undefined results

            const initialAdditivesTags = food.additives_tags?.map((tagId: string) => 
                additivesAll.find(additive=> additive.id === tagId)
            ).filter(Boolean) as Additive[]; // Filter out any undefined results
            
            setAllergensTags(initialAllergensTags || []) 
            setTracesTags(initialTracesTags || [])
            setAdditivesTags(initialAdditivesTags || [])
        }) 
        .catch(error => {
            console.log(error)
        })
        .finally(()=>{
            setAllDone(true)
        })
    },[additivesAll])

    useEffect(() => {
        let newAllergens:string[] = []
        allergensTags.map(allergen => {
            newAllergens.push(allergen.id)
        })
        setValue("allergens", newAllergens.join(", "))
    }, [allergensTags, setValue]);

    useEffect(() => {
        let newTraces:string[] = []
        tracesTags.map(allergen => {
            newTraces.push(allergen.id)
        })
        setValue("traces", newTraces.join(", "))
    }, [tracesTags, setValue]);

    useEffect(() => {
        let newAdditives:string[] = []
        additivesTags.map(additive => {
            newAdditives.push(additive.id)
        })
        setValue("additives", newAdditives.join(", "))

    }, [additivesTags, setValue]);

    useEffect(() => {
        const filtered = allergensAll
            .filter(allergen => !allergensTags.some(tag => tag.id === allergen.id))
            .sort((a, b) => a.name.localeCompare(b.name))

        setFilteredAllergens(filtered);
    }, [allergensAll, allergensTags])

    useEffect(() => {
        const filtered = allergensAll
            .filter(allergen => !tracesTags.some(tag => tag.id === allergen.id))
            .sort((a, b) => a.name.localeCompare(b.name))

        setFilteredTraces(filtered);
    }, [allergensAll, tracesTags])

    useEffect(() => {
        const filtered = additivesAll
            .filter(additive => !additivesTags.some(tag => tag.id === additive.id))
            .sort((a, b) => a.name.localeCompare(b.name))

        setFilteredAdditives(filtered);
    }, [additivesAll, additivesTags])

    useEffect(() => {
        setSearchAdditives(
          filteredAdditives.filter(additive =>
            additive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            additive.id.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }, [searchTerm, filteredAdditives]);

    const onSubmit = (data: any) => {
        setIsSending(true)
        let filteredData = getFilteredFormData(data)
        const formData = new FormData();
        if (window.localStorage.id){
            formData.append("idFood", data.id)
            formData.append("idUser", window.localStorage.id)
            formData.append("type", submissionType)
            formData.append("state", "pending")
            formData.append("foodData", JSON.stringify(filteredData))
            formData.append("imagesFolder",`${data.product_name}-${Date.now().toString()}`)
            if (ingredientsFile) {
                formData.append("ingredients", ingredientsFile);
            }
            if (frontFile) {
                formData.append("front", frontFile);
            }
            if (nutritionFile) {
                formData.append("nutrition", nutritionFile);
            }
            
            console.log(formData)
            try{
                api.post(submissionsURL, formData,{
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + window.localStorage.token
                    }
                })
                .then(response => {
                    if (response.status === 200){
                        
                        setSnackbarMsg("Aporte enviado! Te avisaremos cuando sea aprobado o rechazado.")
                    }
                    else if (response.status === 400){
                        setSnackbarMsg("Error al subir el aporte")
                    }
                    else{
                        setSnackbarMsg("Error")
                    }
                })
            }
            catch (error) {
                console.error("error al subir aporte:", error)
                setSnackbarMsg("Error al subir el aporte")
            }
            finally {
                setIsSending(false)
                setResultOpen(true)
            }
            
        }    
        else{
            
            setSnackbarMsg("Error: Usuario no identificado")
        } 
    }

    const getFilteredFormData = (formData: FormValues) => {
        return Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value !== "")
        );
    };

    const handleAllergensOpen = () => {
        setAllergensOpen(true);
    };

    const handleAllergensClose = () => {
        setAllergensOpen(false);
    };

    const handleTracesOpen = () => {
        setTracesOpen(true);
    };

    const handleTracesClose = () => {
        setTracesOpen(false);
    };

    const handleAdditivesOpen = () => {
        setAdditivesOpen(true);
    };

    const handleAdditivesClose = () => {
        setAdditivesOpen(false);
        setSearchTerm("")
    };

    const handleAllergenSelect = (allergen: Allergen) => {
        if (!allergensTags.some(tag => tag.id === allergen.id)) {
            setAllergensTags([...allergensTags, allergen]);
        }
        setAllergensOpen(false);
    };

    const handleAllergenDelete = (chipToDelete: Allergen) => {
        setAllergensTags(allergensTags.filter((tag) => tag.id !== chipToDelete.id));
        setSnackbarMsg(chipToDelete.name + " eliminado")
        setSnackbarOpen(true)
    };

    const handleTracesSelect = (allergen: Allergen) => {
        if (!tracesTags.some(tag => tag.id === allergen.id)) {
            setTracesTags([...tracesTags, allergen]);
        }
        setTracesOpen(false);
    };

    const handleTracesDelete = (chipToDelete: Allergen) => {
        setTracesTags(tracesTags.filter((tag) => tag.id !== chipToDelete.id));
        setSnackbarMsg(chipToDelete.name + " eliminado")
        setSnackbarOpen(true)
    };

    const handleAdditivesSelect = (additive: Additive) => {
        if (!additivesTags.some(tag => tag.id === additive.id)) {
            setAdditivesTags([...additivesTags, additive]);
        }
        setAdditivesOpen(false);
        setSearchTerm("")
    };

    const handleAdditivesDelete = (chipToDelete: Additive) => {
        setAdditivesTags(additivesTags.filter((tag) => tag.id !== chipToDelete.id));
        setSnackbarMsg(chipToDelete.name + " eliminado")
        setSnackbarOpen(true)
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleKeyDown = (event:any) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.target.blur(); // Remove focus from the input field
        }
      };

      const handleIngredientsChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIngredientsFile(file);
            setIngredientsPreview(URL.createObjectURL(file));
        }
    };
    
    const handleFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFrontFile(file);
            setFrontPreview(URL.createObjectURL(file));
        }
    };
    
    const handleNutritionChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNutritionFile(file);
            setNutritionPreview(URL.createObjectURL(file));
        }
    };

    const clearIngredients = () => {
        setIngredientsFile(null);
        setIngredientsPreview(null);
    };

    const clearFront = () => {
        setFrontFile(null);
        setFrontPreview(null);
    };

    const clearNutrition = () => {
        setNutritionFile(null);
        setNutritionPreview(null);
    };

    const handleOpenImage = (link:string) => {
        setSelectedImage(link)
    }

    const handleCloseImage = () => {
        setSelectedImage(null)
    }

    return ( allDone && <Grid container display="flex" 
                flexDirection="row" 
                justifyContent="space-evenly"
                alignItems="stretch"
                sx={{width: "100vw", maxWidth:"500px", gap:"5px", flexWrap: "wrap", pb: 7}}
            >
                <Box 
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    maxWidth: "500px",
                    position: 'fixed',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    transition: "top 0.3s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    overflow: "hidden", 
                    borderBottom: "5px solid",
                    borderLeft: "5px solid",
                    borderRight: "5px solid",
                    borderColor: "secondary.main",
                    boxSizing: "border-box"
                  }}
                >
                    <Typography variant='h5' width="100%" sx={{py:0.5}} color= "primary.contrastText">
                        {submissionType==="edit"?<>Edición</>:<>Nuevo alimento</>}
                    </Typography>
                </Box>
                <Box
                sx={{
                    marginTop: "60px",
                    width:"90%",
                    gap: 3
                }}
                > 
                    <form onSubmit={handleSubmit(onSubmit)} noValidate encType="multipart/form-data">
                        <TextField 
                        id="id"
                        label="Código" 
                        type="text" 
                        variant="standard" 
                        fullWidth
                        {...register("id", {required: "Ingresar código"})}
                        error={!!errors.id}
                        helperText = {errors.id?.message}
                        sx={{ mb: 2 }}
                        />

                        <TextField 
                        id="product_name" 
                        label="Nombre" 
                        type="text" 
                        variant="standard" 
                        fullWidth
                        {...register("product_name", {required: "Ingresar nombre"})}
                        error={!!errors.product_name}
                        helperText = {errors.product_name?.message}
                        
                        sx={{ mb: 2 }}
                        />
                        <TextField 
                        id="quantity"
                        label="Cantidad" 
                        type="text" 
                        variant="standard" 
                        fullWidth
                        {...register("quantity")}
                        error={!!errors.quantity}
                        
                        helperText = {errors.quantity?.message}
                        sx={{ mb: 2 }}
                        />
                        <TextField 
                        id="serving_size"
                        label="Porción" 
                        type="text" 
                        variant="standard" 
                        fullWidth
                        {...register("serving_size")}
                        error={!!errors.serving_size}
                        helperText = {errors.serving_size?.message}
                        
                        sx={{ mb: 2 }}
                        />
                        <TextField 
                        id="brands"
                        label="Marca" 
                        type="text" 
                        variant="standard" 
                        fullWidth
                        {...register("brands")}
                        error={!!errors.brands}
                        
                        helperText = {errors.brands?.message}
                        sx={{ mb: 2 }}
                        />
                       
                        <TextField
                        id="ingredients_text_es"
                        label="Ingredientes"
                        variant="standard"
                        multiline
                        rows={6} // Default number of rows
                        maxRows={10} // Maximum number of rows it can expand to
                        {...register("ingredients_text_es")}
                        error={!!errors.ingredients_text_es}
                        helperText={errors.ingredients_text_es?.message}
                        
                        fullWidth // Ensures the TextField takes up the full width of its container
                        sx={{ mb: 2 }}
                        />
                        <Typography variant='h6'>
                            Alérgenos
                        </Typography>
                        <Typography variant='subtitle1' sx={{my:1}}>
                            El producto contiene
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "center" }}>
                            {allergensTags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={`${tag.name}`} // Show both id and name
                                    onDelete={() => handleAllergenDelete(tag)}
                                />
                            ))}
                            <Chip
                                icon={<AddCircleIcon sx={{color: "secondary.main"}}/>}
                                label="Agregar"
                                onClick={handleAllergensOpen}
                                sx={{ 
                                    '& .MuiChip-icon': {
                                        color: "secondary.dark", // Customize the icon color here
                                    }
                                }}
                                
                            />
                        </Box>
                        <Typography variant='subtitle1' sx={{my:1}}>
                            El producto puede contener
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "center" }}>
                            {tracesTags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={`${tag.name}`} // Show both id and name
                                    onDelete={() => handleTracesDelete(tag)}
                                />
                            ))}
                            <Chip
                                icon={<AddCircleIcon sx={{color: "secondary.main"}}/>}
                                label="Agregar"
                                onClick={handleTracesOpen}
                                sx={{ 
                                    '& .MuiChip-icon': {
                                        color: "secondary.dark", // Customize the icon color here
                                    }
                                }}
                                
                            />
                        </Box>
                        <Divider />
                        <Typography variant='h6' my={2}>
                            Aditivos
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "center" }}>
                            {additivesTags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={`${tag.name || tag.id}`} // Show both id and name
                                    onDelete={() => handleAdditivesDelete(tag)}
                                />
                            ))}
                            <Chip
                                icon={<AddCircleIcon sx={{color: "secondary.main"}}/>}
                                label="Agregar"
                                onClick={handleAdditivesOpen}
                                sx={{ 
                                    '& .MuiChip-icon': {
                                        color: "secondary.dark", // Customize the icon color here
                                    }
                                }}
                                
                            />
                        </Box>

                        <Dialog onClose={handleAllergensClose} open={allergensOpen}
                        sx={{width: "100%", 
                            maxWidth: "500px", 
                            margin: "auto",
                            height: "80%"
                        }}>
                            <DialogTitle>
                                Selecciona un alérgeno
                            </DialogTitle>
                            <DialogContent>
                                <List sx={{ pt: 0 }}>
                                    {filteredAllergens.map((allergen) => (
                                    <ListItem
                                        key={allergen.id}
                                        onClick={() => handleAllergenSelect(allergen)}
                                        sx={{ cursor: "pointer", fontFamily: "Montserrat" }}
                                    >
                                        <ListItemText primary={`${allergen.name}`} />
                                    </ListItem>
                                    ))}
                                </List>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={handleAllergensClose} variant="contained">
                                Cancelar
                            </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog onClose={handleTracesClose} open={tracesOpen}
                        sx={{width: "100%", 
                            maxWidth: "500px", 
                            margin: "auto",
                            height: "80%"
                        }}>
                            <DialogTitle>
                                Selecciona un alérgeno
                            </DialogTitle>
                            <DialogContent>
                                <List sx={{ pt: 0 }}>
                                    {filteredTraces.map((allergen) => (
                                    <ListItem
                                        key={allergen.id}
                                        onClick={() => handleTracesSelect(allergen)}
                                        sx={{ cursor: "pointer", fontFamily: "Montserrat" }}
                                    >
                                        <ListItemText primary={`${allergen.name}`} />
                                    </ListItem>
                                    ))}
                                </List>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={handleTracesClose} variant="contained">
                                Cancelar
                            </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog onClose={handleAdditivesClose} open={additivesOpen}
                        sx={{width: "100%", 
                            maxWidth: "500px", 
                            margin: "auto",
                            height: "80%"
                        }}>
                            <DialogTitle>
                                Selecciona un aditivo
                                
                            </DialogTitle>
                            <DialogContent>
                            
                                <List sx={{ pt: 0 }}>
                                    {searchAdditives.map((additive) => (
                                    <ListItem
                                        key={additive.id}
                                        onClick={() => handleAdditivesSelect(additive)}
                                        sx={{ cursor: "pointer", fontFamily: "Montserrat" }}
                                    >
                                        <ListItemText primary={`${additive.name || additive.id}`} />
                                    </ListItem>
                                    ))}
                                </List>
                            </DialogContent>
                            <DialogActions>
                            <TextField
                                label="Buscar aditivo"
                                variant="standard"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                sx={{ mb: 2 }} // Adds some spacing below the search box
                                />
                            <Button onClick={handleAdditivesClose} variant="contained">
                                Cancelar
                            </Button>
                            </DialogActions>
                        </Dialog>
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={6000}
                            onClose={handleSnackbarClose}
                            sx={{bottom: "5vh"}}
                        >
                            <Alert 
                                onClose={handleSnackbarClose} 
                                severity="success" 
                                variant="filled" 
                                sx={{ width: '100%',
                                    bgcolor: "secondary.main",
                                    color: "secondary.contrastText",   
                                }}
                             >
                                {snackbarMsg}
                            </Alert>
                        </Snackbar>
                        <Divider />
                        <Typography variant='h6' my={2}>
                            Información nutricional
                        </Typography>

                        <FormControlLabel 
                        control={<Checkbox onChange={(e) => setNoNutrition(e.target.checked)}/>} 
                        label="No sale en el envase" 
                        />
                        
                        {!noNutrition && 
                        <Box sx={{width:"100%", display: "flex", justifyContent: "center"}}>
                            <TableContainer component={Paper} sx={{ marginBottom: 2, width:"100%" }}>
                                <Table aria-label="user stats table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{bgcolor: "primary.main"}}>
                                                <Typography variant="subtitle1" sx={{color: "primary.contrastText"}}>
                                                    Item
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{bgcolor: "primary.main"}} align="center">
                                                <Typography variant="subtitle1" sx={{color: "primary.contrastText"}}>
                                                    100 g / 100 ml
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {nutrition.map((nutriment, index)=> (
                                            <TableRow key={nutriment.field} sx={{ height: 30,  bgcolor: index % 2 === 0 ? "transparent" : "secondary.light"  }}>
                                            <TableCell sx={{ padding: '4px 8px' }}>
                                            <Typography>{nutriment.label}</Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                                <TextField
                                                variant="outlined"
                                                sx={{width:80, "& .MuiInputBase-input": { fontSize: 14, height: 10, padding: 1 }}}
                                                {...register(nutriment.field, { 
                                                    value: getValues(nutriment.field) || ""
                                                })}
                                                onChange={(e) => setValue(nutriment.field, e.target.value.replace(",", "."))}
                                                inputProps={{ 
                                                    type: "number", // Set type to text for custom validation
                                                    pattern: "[0-9]*" // Optional: hints to mobile browsers to show numeric keyboard
                                                }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        }
                        
                        <Divider />
                        <Typography variant='h6' my={2}>
                            Imágenes
                        </Typography>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width:"100%",
                            my:2
                        }}>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%"
                            }}>
                                <Typography variant="subtitle1">
                                    Ingredientes
                                </Typography>
                                    <img src={foodOldImages.ingredients}
                                        alt="Sin imágen" 
                                        style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                        onClick={()=>handleOpenImage(foodOldImages.ingredients)}
                                />
                            </Box>
                            
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%"
                            }}>
                                <Typography variant="subtitle1">
                                    Frente
                                </Typography>
                                    <img src={foodOldImages.front}
                                        alt="Sin imágen" 
                                        style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                        onClick={()=>handleOpenImage(foodOldImages.front)}
                                />
                            </Box>
                            
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%",
                            }}>
                                <Typography variant="subtitle1">
                                    Nutrición
                                </Typography>
                                    <img src={foodOldImages.nutrition}
                                        alt="Sin imágen" 
                                        style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                        onClick={()=>handleOpenImage(foodOldImages.nutrition)}
                                />
                            </Box>
                            
                        </Box>
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width:"100%",
                            my:2
                        }}>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%"
                            }}>
                                <Typography variant="subtitle1">
                                    Nueva imágen
                                </Typography>
                                {ingredientsPreview && (<div>
                                    <img src={ingredientsPreview} alt="Ingredientes" style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10 }} />
                                    <IconButton onClick={clearIngredients}>
                                        <DeleteForeverRoundedIcon sx={{color: "error.main", height: "32px", width: "32px"}}/>
                                    </IconButton>
                                    </div>
                                )}
                                {!ingredientsFile && (
                                    <IconButton component="label">
                                        <AddAPhotoRoundedIcon sx={{color: "secondary.dark", height: "32px", width: "32px"}}/>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleIngredientsChange}
                                        />
                                    </IconButton>
                                )}
                            </Box>
                            
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%"
                            }}>
                                <Typography variant="subtitle1">
                                Nueva imágen
                                </Typography>
                                {frontPreview && (<div>
                                    <img src={frontPreview} alt="Frente" style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10 }} />
                                    <IconButton onClick={clearFront}>
                                        <DeleteForeverRoundedIcon sx={{color: "error.main", height: "32px", width: "32px"}}/>
                                    </IconButton>
                                    </div>
                                )}
                                {!frontFile && (
                                    <IconButton component="label">
                                        <AddAPhotoRoundedIcon sx={{color: "secondary.dark", height: "32px", width: "32px"}}/>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleFrontChange}
                                        />
                                    </IconButton>
                                )}
                            </Box>
                            
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width:"100%"
                            }}>
                                <Typography variant="subtitle1">
                                Nueva imágen
                                </Typography>
                                {nutritionPreview && (<div>
                                    <img src={nutritionPreview} alt="Nutrición" style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10 }} />
                                    <IconButton onClick={clearNutrition}>
                                        <DeleteForeverRoundedIcon sx={{color: "error.main", height: "32px", width: "32px"}}/>
                                    </IconButton>
                                    </div>
                                )}
                                {!nutritionFile && (
                                    <IconButton component="label">
                                        <AddAPhotoRoundedIcon sx={{color: "secondary.dark", height: "32px", width: "32px"}}/>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleNutritionChange}
                                        />
                                    </IconButton>
                                )}
                                
                            </Box>
                            
                        </Box>
                        <Button 
                            variant="contained" 
                            type="submit"
                            disabled={isSending}
                            startIcon={isSending ? <CircularProgress size={24} /> : null}
                        >
                            {isSending ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Dialog
                        open={Boolean(selectedImage)}
                        onClose={handleCloseImage}
                        fullWidth
                        maxWidth="md"
                    >
                            <DialogContent dividers style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                                <img
                                    src={selectedImage || NoPhoto}
                                    alt="Full-size"
                                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button variant="contained" onClick={handleCloseImage}>
                                    Cerrar
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Snackbar
                            open={resultOpen}
                            autoHideDuration={6000}
                            onClose={() => setResultOpen(false)}
                        >
                            <Alert onClose={() => setResultOpen(false)} severity={snackbarMsg.includes('Error') ? 'error' : 'success'}>
                            {snackbarMsg}
                            </Alert>
                        </Snackbar>
                    </form>
                </Box>
                
            
            </Grid>
    )
}

export default FoodEdit
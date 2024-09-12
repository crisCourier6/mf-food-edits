import React, { ChangeEvent } from "react";
import { Button, Box, Alert, Grid, Typography, TextField, Chip, 
    Dialog, DialogTitle, List, ListItem, ListItemText, DialogActions, 
    IconButton, DialogContent, Snackbar, CircularProgress,
    Divider} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FoodExternal } from "../interfaces/foodExternal";
import { useForm } from "react-hook-form";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

type Allergen = { id: string; name: string};
type Additive = { id: string; name: string};

const FoodEdit: React.FC<{ isAppBarVisible: boolean }> = ({ isAppBarVisible }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const additivesURL = "http://192.168.100.6:8080/submissions-additives"
    const allergensURL = "http://192.168.100.6:8080/submissions-allergens"
    const foodURL = "http://192.168.100.6:8080/submissions-food"
    const submissionsURL = "http://192.168.100.6:8080/submissions"
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
    const form = useForm<FoodExternal>({
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            id: "0",
            product_name: "nombre",
            brands: "marcas",
            quantity: "cantidad",
            serving_size: "porción",
            ingredients_text_es: "ingredientes",
            allergens: "",
            traces: "",
            additives: ""
        }
    })
    const { register, handleSubmit, formState, control, getValues, watch, setValue } = form
    const {errors} = formState    

    useEffect(()=>{
        axios.get(allergensURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(response => {
            console.log(response.data)
            setAllergensAll(response.data)
        })
    },[])

    useEffect(()=>{
        axios.get(additivesURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(response => {
            console.log(response.data)
            setAdditivesAll(response.data)
        })
    },[allergensAll])

    useEffect(()=>{
       axios.get(foodURL + "/" + id, {
        withCredentials: true,
        headers: {
            Authorization: "Bearer " + window.localStorage.token
        }
       })
       .then((response)=>{
            console.log(response.data)
            let food = JSON.parse(response.data.foodData)
            setValue("id", food.id || "");
            setValue("product_name", food.product_name || "");
            setValue("quantity", food.quantity || "");
            setValue("brands", food.brands || "");
            setValue("ingredients_text_es", food.ingredients_text || "");
            setValue("serving_size", food.serving_size || "");
            setValue("allergens", food.allergens_tags.join(", ") || "")
            setValue("traces", food.traces_tags.join(", ") || "")
            setValue("additives", food.additives_tags.join(", ") || "")

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
    },[additivesAll])

    useEffect(() => {
        let newAllergens:string[] = []
        allergensTags.map(allergen => {
            newAllergens.push(allergen.id)
        })
        setValue("allergens", newAllergens.join(", "))
        console.log(newAllergens)
    }, [allergensTags, setValue]);

    useEffect(() => {
        let newTraces:string[] = []
        tracesTags.map(allergen => {
            newTraces.push(allergen.id)
        })
        setValue("traces", newTraces.join(", "))
        console.log(newTraces)
    }, [tracesTags, setValue]);

    useEffect(() => {
        let newAdditives:string[] = []
        additivesTags.map(additive => {
            newAdditives.push(additive.id)
        })
        setValue("additives", newAdditives.join(", "))
        console.log(newAdditives)
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

    const onSubmit = (data: FoodExternal) => {
        setIsSending(true)
        console.log(data)
        const formData = new FormData();
        if (window.localStorage.id){
            formData.append("idFood", data.id)
            formData.append("idUser", window.localStorage.id)
            formData.append("type", "edit")
            formData.append("state", "pending")
            formData.append("foodData", JSON.stringify(data))
            formData.append("imagesFolder", Date.now().toString())
            if (ingredientsFile) {
                formData.append("imgupload_ingredients", ingredientsFile);
            }
            if (frontFile) {
                formData.append("imgupload_front", frontFile);
            }
            if (nutritionFile) {
                formData.append("imgupload_nutrition", nutritionFile);
            }
            
            console.log(formData)
            try{
                axios.post(submissionsURL, formData,{
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + window.localStorage.token
                    }
                })
                .then(response => {
                    if (response.status === 200){
                        console.log("Aporte subido")
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
            console.log("no hay usuario")
            setSnackbarMsg("Error: Usuario no identificado")
        }
        
        
    }

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

    return <Grid container display="flex" 
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
                        Edición
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
                        {...register("quantity", {required: "Ingresar cantidad"})}
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
                        {...register("serving_size", {required: "Ingresar cantidad por porción"})}
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
                        {...register("brands", {required: "Ingresar marca"})}
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
                                    Frente
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
                                    Nutrición
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
  
}

export default FoodEdit
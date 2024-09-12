import React from "react";
import { Button, Grid, Input, Typography,} from '@mui/material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from "react-hook-form";

const ImageUpload: React.FC = () => {
    const { id } = useParams()
    const submissionsURL = "http://192.168.100.6:8080/submissions-images"
    const [ingredientsFile, setIngredientsFile] = useState<File | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [nutritionFile, setNutritionFile] = useState<File | null>(null);
    const form = useForm({
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            product_image:null
        }
    })
    const { register, handleSubmit, formState, control, getValues, watch, setValue } = form
    const {errors} = formState  

    const handleFileChange = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        switch(type) {
            case 'ingredients':
                setIngredientsFile(file);
                break;
            case 'front':
                setFrontFile(file);
                break;
            case 'nutrition':
                setNutritionFile(file);
                break;
            default:
                break;
        }
    };

    const onSubmit = async () => {
        try {
            const formData = new FormData();
            
            // Append the selected image file
            if (ingredientsFile) {
                const file = ingredientsFile;
                console.log(file)
                const newFileName = `${id}-ingredients`; // Modify the file name as needed
                
                // Use File constructor to create a new file object
                const newFile = new File([file], newFileName, { type: file.type });
                
                formData.append("image_ingredients", ingredientsFile, newFileName);
            }
            if (frontFile) {
                const file = frontFile;
                const newFileName = `${id}-front`; // Modify the file name as needed
                
                // Use File constructor to create a new file object
                const newFile = new File([file], newFileName, { type: file.type });
                
                formData.append("image_front", frontFile, newFileName);
            }
            if (nutritionFile) {
                const file = nutritionFile;
                const newFileName = `${id}-nutrition`; // Modify the file name as needed
                
                // Use File constructor to create a new file object
                const newFile = new File([file], newFileName, { type: file.type });
                
                formData.append("image_nutrition", nutritionFile, newFileName);
            }
            formData.append("submissionId", "101")
            console.log(formData)
            // Send the form data with an Axios POST request
            const response = await axios.post(submissionsURL, formData, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                },
                
            });
    
            // Handle the response
            console.log(response.data);
        } catch (error) {
            console.error("Error uploading data:", error);
        }
    };

    return <Grid container display="flex" 
                flexDirection="row" 
                justifyContent="space-evenly"
                alignItems="stretch"
                sx={{width: "100vw", maxWidth:"500px", gap:"5px", flexWrap: "wrap", pb: 7}}
            >
                <form onSubmit={handleSubmit(onSubmit)} noValidate encType="multipart/form-data">
                <Button variant="contained" component="label">
                    Subir imagen de Ingredientes
                    <Input
                        type="file"
                        hidden
                        
                        onChange={handleFileChange('ingredients')}
                    />
                </Button>

                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                    Subir imagen del Frente
                    <Input
                        type="file"
                        hidden
                        
                        onChange={handleFileChange('front')}
                    />
                </Button>

                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                    Subir imagen de Nutrición
                    <Input
                        type="file"
                        hidden
                        
                        onChange={handleFileChange('nutrition')}
                    />
                </Button>

                <Typography variant="body2" sx={{ mt: 2 }}>
                    {ingredientsFile && `Archivo de ingredientes seleccionado: ${ingredientsFile.name}`}
                    {frontFile && `Archivo del frente seleccionado: ${frontFile.name}`}
                    {nutritionFile && `Archivo de nutrición seleccionado: ${nutritionFile.name}`}
                    {(!ingredientsFile && !frontFile && !nutritionFile) && "No se ha seleccionado ningún archivo"}
                </Typography>
                    <Button type="submit" variant="contained" > Subir imagen</Button>
                </form>
            </Grid>
}

export default ImageUpload
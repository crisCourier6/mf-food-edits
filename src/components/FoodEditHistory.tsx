import React, { useEffect, useState } from "react";
import { Button, Box, Grid, Typography, CircularProgress, Card, CardContent, Dialog, 
    DialogContent, DialogActions, DialogTitle, Divider, Chip} from '@mui/material';
import { useParams} from 'react-router-dom';
import api from "../api";
import { UserEditsFood } from "../interfaces/userEditsFood";
import dayjs from "dayjs";

type Allergen = { id: string; name: string};
type Additive = { id: string; name: string};

const FoodEditUserList: React.FC<{isAppBarVisible:boolean}> = ({ isAppBarVisible }) => {
    const { id } = useParams()
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const [foodEditAll, setFoodEditAll] = useState<UserEditsFood[]>([])
    const [selectedEdit, setSelectedEdit] = useState<UserEditsFood|null>(null);
    const [showEdit, setShowEdit] = useState(false)
    const [allDone ,setAllDone] = useState(false)
    const editsURL = "/submissions"
    const additivesURL = "/submissions-additives"
    const allergensURL = "/submissions-allergens"
    const [allergensAll, setAllergensAll] = useState<Allergen[]>([])
    const [allergensTags, setAllergensTags] = useState<Allergen[]>([])
    const [additivesAll, setAdditivesAll] = useState<Additive[]>([])
    const [additivesTags, setAdditivesTags] = useState<Additive[]>([])
    const [tracesTags, setTracesTags] = useState<Allergen[]>([])

    useEffect(()=>{
        document.title = "Historial de ediciones - EyesFood";
        api.get(allergensURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
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
                Authorization: "Bearer " + token
            }
        })
        .then(response => {
            setAdditivesAll(response.data)
        })
    },[allergensAll])

    useEffect(()=>{
        let queryParams = `?f=${id}&a=true`
        api.get(`${editsURL}${queryParams}`, 
                 {
                     withCredentials: true,
                     headers: {
                         Authorization: "Bearer " + token
                     }
                 }) 
                 .then( response=> {
                    setFoodEditAll(response.data);
                    
                 })
                 .catch(error => {
                    console.log(error)
                 })
                 .finally(()=>{
                     setAllDone(true)
                 })
    }, [additivesAll])

    const handleOpenEdit = (edit:UserEditsFood) => {
        setSelectedEdit(edit)
        const initialAllergensTags = edit.foodData?.allergens?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results

        const initialTracesTags = edit.foodData?.traces?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results

        const initialAdditivesTags = edit.foodData?.additives?.split(", ").map((tagId: string) => 
            additivesAll.find(additive=> additive.id === tagId)
        ).filter(Boolean) as Additive[]; // Filter out any undefined results
        console.log(initialAllergensTags)
        setAllergensTags(initialAllergensTags || []) 
        setTracesTags(initialTracesTags || [])
        setAdditivesTags(initialAdditivesTags || [])
        setShowEdit(true)
    }

    const handleCloseEdit = () => {
        setShowEdit(false)
    }

    return ( allDone?
    <Grid container 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{width: "100vw", maxWidth:"500px", gap:2, flexWrap: "wrap", pb: 7}}>
            <Box 
                sx={{
                    position: 'sticky',
                    top: isAppBarVisible?"50px":"0px",
                    width:"100%",
                    maxWidth: "500px",
                    transition: "top 0.1s",
                    backgroundColor: 'primary.dark', // Ensure visibility over content
                    zIndex: 100,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    
                    boxSizing: "border-box"
                  }}
            >
                <Typography variant='h5' width="100%" sx={{py:0.5}} color= "primary.contrastText">
                    Historial de ediciones
                </Typography>
            </Box>
            { foodEditAll.map((edit)=>{
                return (
                <Card key={edit.id} sx={{
                border: "4px solid", 
                borderColor: "primary.dark", 
                bgcolor: "primary.contrastText",
                width:"90%", 
                height: "10vh", 
                minHeight: "40px",
                maxHeight: "80px", 
                display:"flex",
                }}>
                    <CardContent onClick={()=>handleOpenEdit(edit)} sx={{
                    width:"100%",
                    height: "100%", 
                    display:"flex", 
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding:0,
                    }}>
                        
                        <Typography 
                        variant="body2" 
                        color="primary.dark" 
                        fontSize={13} 
                        fontFamily="Montserrat"
                        height="60%" 
                        sx={{alignContent:"center", cursor:"pointer", flex: 1}}>
                            {dayjs(edit.createdAt).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography 
                        variant="body2" 
                        color="primary.dark" 
                        fontSize={13} 
                        fontFamily="Montserrat"
                        height="60%" 
                        sx={{alignContent:"center", cursor:"pointer", flex: 2}}>
                            {edit.foodData?.product_name + "-" + edit.foodData?.brands?.split(",")[0]}
                        </Typography>
                    </CardContent>
                </Card>
                
                
                )
            })
            }
            <Dialog open={showEdit} onClose={handleCloseEdit}
            PaperProps={{
                sx: { 
                    width: "90vw", 
                    maxWidth: "500px", 
                    margin: "auto"
                }
                }}>
                <DialogTitle 
                sx={{display: "flex", 
                    justifyContent: "center", 
                    bgcolor: selectedEdit?.state==="pending"?"warning.main":selectedEdit?.state==="accepted"?"secondary.main":"error.main", 
                    color: selectedEdit?.state==="pending"?"warning.contrastText":selectedEdit?.state==="accepted"?"secondary.contrastText":"white"}}>
                    {dayjs(selectedEdit?.createdAt).format('DD/MM/YYYY')}
                </DialogTitle>
                <DialogContent>
                    <Typography variant='h6' sx={{my: 1}}>
                        Información general
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Código: </span>{selectedEdit?.foodData?.id}</li>
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Nombre: </span>{selectedEdit?.foodData?.product_name}</li>
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Cantidad: </span>{selectedEdit?.foodData?.quantity}</li>
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Porción: </span>{selectedEdit?.foodData?.serving_size}</li>
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Marca: </span>{selectedEdit?.foodData?.brands}</li>
                    </Typography>
                    <Typography variant='subtitle1' color= "primary.dark">
                        <li><span style={{fontWeight: "bold"}}>Ingredientes: </span>{selectedEdit?.foodData?.ingredients_text_es}</li>
                    </Typography>
                    <Divider sx={{my:2}}/>
                    <Typography variant='h6'>
                        Alérgenos
                    </Typography>
                    <Typography variant='subtitle1' sx={{my:1}}>
                        El producto contiene:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                        {allergensTags.map((tag) => (
                            <Chip
                                key={tag.id}
                                label={`${tag.name}`} // Show both id and name
                            />
                        ))}
                    </Box>
                    <Typography variant='subtitle1' sx={{my:1}}>
                        El producto puede contener:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                        {tracesTags.map((tag) => (
                            <Chip
                                key={tag.id}
                                label={`${tag.name}`} // Show both id and name
                            />
                        ))}
                    </Box>
                    <Divider />
                    <Typography variant='h6' my={2}>
                        Aditivos
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                        {additivesTags.map((tag) => (
                            <Chip
                                key={tag.id}
                                label={`${tag.name || tag.id}`} // Show both id and name
                            />
                        ))}
                        
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleCloseEdit} color="primary">
                        Salir
                    </Button>
                </DialogActions>
            </Dialog> 
        </Grid> :
        <CircularProgress/>   
    )
}

export default FoodEditUserList
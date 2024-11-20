import React, { useEffect, useState } from "react";
import { Button, Box, Alert, Grid, Dialog, DialogContent, DialogActions, TextField, Snackbar, IconButton, 
    Typography, DialogTitle, Tooltip, Chip, Divider, CircularProgress, TableContainer, Table, TableHead, 
    TableRow, TableCell, TableBody, Paper} from '@mui/material';
import api from "../api";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid"
import { esES } from '@mui/x-data-grid/locales';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoPhoto from "../../public/no-photo.png"
import { UserEditsFood } from "../interfaces/userEditsFood";

type Allergen = { id: string; name: string};
type Additive = { id: string; name: string};
type Nut = {label:string, value:number}

const FoodEditList: React.FC<{isAppBarVisible:boolean}> = ({ isAppBarVisible }) => {
    const editsURL = "/submissions"
    const additivesURL = "/submissions-additives"
    const allergensURL = "/submissions-allergens"
    const imagesURL = process.env.REACT_APP_IMAGES_URL
    const [edits, setEdits] = useState<UserEditsFood[]>([])
    const [reason, setReason] = useState("")
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<UserEditsFood>({id:"", createdAt: new Date(), judgedAt: new Date()});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [filterModel, setFilterModel] = useState<GridFilterModel>({items: [] });
    const [allergensAll, setAllergensAll] = useState<Allergen[]>([])
    const [allergensTags, setAllergensTags] = useState<Allergen[]>([])
    const [additivesAll, setAdditivesAll] = useState<Additive[]>([])
    const [additivesTags, setAdditivesTags] = useState<Additive[]>([])
    const [tracesTags, setTracesTags] = useState<Allergen[]>([])
    const [processingRequest, setProcessingRequest] = useState(false)
    const [nutrition, setNutrition] = useState<Nut[]>([])
    const [selectedImage, setSelectedImage] = useState<string|null>(null)
    
    useEffect(()=>{
        document.title = "Aportes de usuarios - EF Admin";
        api.get(allergensURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then(response => {
            setAllergensAll(response.data)
        })
        .catch(error => console.log(error.response))
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
        .catch(error => console.log(error.response))
    },[allergensAll])

    useEffect(()=>{
        api.get(editsURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + window.localStorage.token
            }
        })
        .then((res)=>{
            const updatedFoodEdits = res.data.map((item: any) => {
                // Parse foodData from JSON string to an object
                // Return a new object with parsed foodData
                return { ...item, 
                    createdAt: new Date(item.createdAt),
                    judgedAt: new Date(item.judgedAt)
                }
            });
            const sortedData = updatedFoodEdits.sort((a:UserEditsFood,b:UserEditsFood) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setEdits(sortedData)
                
        })
        .catch(error => console.log(error.response))
    },[additivesAll])

    const columns: GridColDef[] = [
        {field: "createdAt", headerName: "Fecha creación", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "idUser", headerName: "Usuario", flex: 1.2, headerClassName: "header-colors", headerAlign: "center"},
        {field: "product_name", headerName: "Producto", flex: 2, headerClassName: "header-colors", headerAlign: "center", align: "center",
            valueGetter: (params) => params.row.foodData?.product_name + " - " + params.row.foodData?.brands.split(",")[0] || ""
        },  
        {field: "type", headerName: "Tipo", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "singleSelect",
            valueOptions: [
                {value: "new", label: "Nuevo"}, 
                {value: "edit", label: "Edición"}, 
            ]
        },
        {field: "state", headerName: "Estado", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "singleSelect",
            valueOptions: [
                {value: "pending", label: "Pendiente"}, 
                {value: "accepted", label: "Aceptada"},
                {value: "rejected", label: "Rechazada"},
            ]
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            flex: 1,
            headerClassName: "header-colors",
            headerAlign: "center", 
            type: "actions",
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    height: '100%',
                }}>
                    <Tooltip title="Evaluar aporte" key="edit" placement="left" arrow={true}>
                        <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                        <IconButton color="error" onClick={() => {
                            setSelectedEdit(params.row);
                            setOpenDeleteDialog(true);}}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    
                </Box>
            )
        }
    ]

      const handleDelete = async (id: string) => {
        try {
            await api.delete(`${editsURL}/${id}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + window.localStorage.token
                }
            });
            setEdits(edits.filter((edit: UserEditsFood) => edit.id !== id));
            setSnackbarMessage('Solicitud eliminada.');
        } catch (error) {
            console.log(error);
            setSnackbarMessage('Error al intentar eliminar solicitud');
        } finally {
            setOpenDeleteDialog(false);
            setSnackbarOpen(true);
        }
    };

    const handleEdit = (edit: any) => {
        setSelectedEdit(edit);
        setNutrition([
            { label: "Energía (kcal)", value: edit.foodData.nutriment_energy || "" },
            { label: "Proteínas (g)", value: edit.foodData.nutriment_proteins || "" },
            { label: "Grasa total (g)", value: edit.foodData.nutriment_fat || "" },
            { label: "G. Saturadas (g)", value: edit.foodData["nutriment_saturated-fat"] || "" },
            { label: "G. Monoinsat. (g)", value: edit.foodData["nutriment_monounsaturated-fat"] || "" },
            { label: "G. Poliinsat. (g)", value: edit.foodData["nutriment_polyunsaturated-fat"] || "" },
            { label: "G. Trans (g)", value: edit.foodData["nutriment_trans-fat"] || "" },
            { label: "Colesterol (mg)", value: edit.foodData.nutriment_cholesterol || "" },
            { label: "H. de C. Disp. (g)", value: edit.foodData.nutriment_carbohydrates || "" },
            { label: "Azúcares totales (g)", value: edit.foodData.nutriment_sugars || "" },
            { label: "Sodio (mg)", value: edit.foodData.nutriment_sodium || "" },
          ])  
        const initialAllergensTags = edit.foodData.allergens?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results

        const initialTracesTags = edit.foodData.traces?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results

        const initialAdditivesTags = edit.foodData.additives?.split(", ").map((tagId: string) => 
            additivesAll.find(additive=> additive.id === tagId)
        ).filter(Boolean) as Additive[]; // Filter out any undefined results
        console.log(initialAllergensTags)
        setAllergensTags(initialAllergensTags || []) 
        setTracesTags(initialTracesTags || [])
        setAdditivesTags(initialAdditivesTags || [])
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleOpenImage = (link:string) => {
        setSelectedImage(link)
    }

    const handleCloseImage = () => {
        setSelectedImage(null)
    }

    const handleStateChange = async (id:string, newState: string, rejectReason?: string) => {
        setProcessingRequest(true)
        try {
            const formData = new FormData();
            const change = {
                ...selectedEdit,
                state: newState,
                rejectReason: rejectReason,
                idJudge: window.localStorage.id,
            }
            console.log(change)
            let res = await api.post(`${editsURL}/${id}/evaluate`,
                change,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + window.localStorage.token
                    }
                }
            )
            const updatedEdits:any = edits.map((edit:any) => 
                edit.id === id ? { 
                    ...edit, 
                    state: newState,
                    rejectReason,
                    idJudge: window.localStorage.id
                    } : edit
            );
            setEdits(updatedEdits);
            console.log(updatedEdits)
            if (selectedEdit?.id === id) {
                setSelectedEdit((prevEdit:any) => ({
                    ...prevEdit,
                    state: newState,
                    rejectReason,
                    idJudge: window.localStorage.id
                }));
            }
            setSnackbarMessage('Solicitud evaluada con éxito');
            setSnackbarOpen(true)     
        }
        catch (error){
            console.log(error)
        }
        finally{
            setProcessingRequest(false)
        }
       
    };

    return ( 
        <Grid container 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{width: "100vw", maxWidth:"1000px", gap:"10px"}}>
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
                    Aportes de usuarios
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width:"90vw",
                maxWidth: "1000px",
                overflow: "auto",
                marginTop: "60px",
                
            }}>
                <DataGrid 
                    rows={edits}
                    columns={columns}
                    rowHeight={32}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    slots={{ toolbar: GridToolbar }}
                    pageSizeOptions={[5, 10]}
                    filterModel={filterModel}
                    onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Apply locale directly
                    sx={{
                        
                        width: "100%", 
                        minWidth: 0,
                        '& .MuiDataGrid-row:nth-of-type(odd)': {
                            backgroundColor: 'secondary.light', // Light grey for odd rows
                            fontFamily: "Montserrat"
                        },
                        '& .MuiDataGrid-row:nth-of-type(even)': {
                            backgroundColor: '#ffffff', // White for even rows
                            fontFamily: "Montserrat"
                        },
                        '& .MuiDataGrid-sortIcon': {
                            color: 'primary.contrastText', // Change sort icon color
                        },
                        '& .MuiDataGrid-menuIconButton': {
                            color: 'primary.contrastText', // Change column menu icon color
                        },
                        '& .header-colors': {
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: "bold",
                            fontFamily: "Righteous",
                            whiteSpace: "normal"
                        },
                        
                    }}
                    />
                    
                    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                        <DialogTitle>Borrar solicitud</DialogTitle>
                        <DialogContent>
                            ¿Seguro que desea borrar esta solicitud?
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                                No
                            </Button>
                            <Button onClick={() => handleDelete(selectedEdit?.id)} variant="contained" color="primary">
                                Sí
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}
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
                            bgcolor: selectedEdit.state==="pending"?"primary.dark":"secondary.main", 
                            color: selectedEdit.state==="pending"?"secondary.main":"secondary.contrastText"}}>
                            {selectedEdit.state==="pending"?<> Evaluar solicitud </>: <>Solicitud evaluada</>}
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant='h6' sx={{my: 1}}>
                                Información general
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Código: </span>{selectedEdit.foodData?.id}</li>
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Nombre: </span>{selectedEdit.foodData?.product_name}</li>
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Cantidad: </span>{selectedEdit.foodData?.quantity}</li>
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Porción: </span>{selectedEdit.foodData?.serving_size}</li>
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Marca: </span>{selectedEdit.foodData?.brands}</li>
                            </Typography>
                            <Typography variant='subtitle1' color= "primary.dark">
                                <li><span style={{fontWeight: "bold"}}>Ingredientes: </span>{selectedEdit.foodData?.ingredients_text_es}</li>
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
                            <Divider />
                            <Typography variant='h6' my={2}>
                                Información nutricional
                            </Typography>
                            <Box sx={{width:"100%", display: "flex", justifyContent: "center"}}>
                                <TableContainer component={Paper} sx={{ marginBottom: 2, width:"90%" }}>
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
                                                <TableRow key={nutriment.label} sx={{ height: 30,  bgcolor: index % 2 === 0 ? "transparent" : "secondary.light"  }}>
                                                <TableCell sx={{ padding: '4px 8px' }}>
                                                    <Typography>
                                                        {nutriment.label}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                                    <Typography variant="subtitle1">
                                                        {nutriment.value}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>   
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
                                    <button 
                                         onClick={()=>handleOpenImage(`${imagesURL}/${selectedEdit.imagesFolder}/ingredients.jpg`)}
                                        style={{ 
                                            background: "none", 
                                            border: "none", 
                                            padding: 0, 
                                            cursor: "pointer" 
                                        }} 
                                        aria-label="Ver imágen"
                                    >
                                        <img src={`${imagesURL}/${selectedEdit.imagesFolder}/ingredients.jpg`}
                                         alt="Ingredientes" 
                                         style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                        
                                    />
                                    </button>
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
                                    <button 
                                         onClick={()=>handleOpenImage(`${imagesURL}/${selectedEdit.imagesFolder}/front.jpg`)}
                                        style={{ 
                                            background: "none", 
                                            border: "none", 
                                            padding: 0, 
                                            cursor: "pointer" 
                                        }} 
                                        aria-label="Ver imágen"
                                    >
                                        <img src={`${imagesURL}/${selectedEdit.imagesFolder}/front.jpg`}
                                         alt="Frente" 
                                         style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                         
                                    />
                                    </button>
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
                                    <button 
                                         onClick={()=>handleOpenImage(`${imagesURL}/${selectedEdit.imagesFolder}/nutrition.jpg`)}
                                        style={{ 
                                            background: "none", 
                                            border: "none", 
                                            padding: 0, 
                                            cursor: "pointer" 
                                        }} 
                                        aria-label="Ver imágen"
                                    >
                                        <img src={`${imagesURL}/${selectedEdit.imagesFolder}/nutrition.jpg`}
                                         alt="Nutrición" 
                                         style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                         
                                    />
                                    </button>
                                </Box>
                                
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            {!processingRequest? selectedEdit?.state === "pending" && (<>
                                    <Button variant="contained" onClick={()=>handleStateChange(selectedEdit.id, "accepted")} color="primary">Aceptar</Button>
                                    <Button variant="contained" disabled={reason===""} onClick={()=>handleStateChange(selectedEdit.id, "rejected", reason)} color="primary">Rechazar</Button>
                                    <TextField 
                                    value={reason} 
                                    label="Razón de rechazo"  
                                    variant="standard"
                                    onChange={(e) => setReason(e.target.value)}
                                    multiline
                                    rows={2}/>
                                </>
                            ):<CircularProgress/>} 
                            <Button variant="contained" onClick={handleCloseEditDialog} color="primary">
                                Salir
                            </Button>
                        </DialogActions>
                    </Dialog>
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
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={snackbarMessage}
                    >
                        <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                    
            </Box>
        </Grid>
    )

}

export default FoodEditList
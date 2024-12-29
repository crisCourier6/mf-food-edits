import React, { useEffect, useState } from "react";
import { Button, Box, Alert, Grid, Dialog, DialogContent, DialogActions, TextField, Snackbar, IconButton, 
    Typography, DialogTitle, Tooltip, Chip, Divider, CircularProgress, TableContainer, Table, TableHead, 
    TableRow, TableCell, TableBody, Paper,
    Checkbox,
    RadioGroup,
    FormControlLabel,
    Radio,
    useMediaQuery} from '@mui/material';
import api from "../api";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid"
import { esES } from '@mui/x-data-grid/locales';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import NoPhoto from "../../public/no-photo.png"
import { UserEditsFood } from "../interfaces/userEditsFood";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import { FoodLocal } from "../interfaces/foodLocal";
import { Allergen } from "../interfaces/allergen";
import { Additive } from "../interfaces/additive";
import { FoodHasAllergen } from "../interfaces/foodHasAllergen";
import { FoodHasAdditive } from "../interfaces/foodHasAdditive";

type Nut = {label:string, value:number|string}

const FoodEditList: React.FC<{isAppBarVisible:boolean, onPendingCountChange:(count:number)=>void}> = ({ isAppBarVisible, onPendingCountChange }) => {
    const editsURL = "/submissions"
    const additivesURL = "/submissions-additives"
    const allergensURL = "/submissions-allergens"
    const foodURL = "/submissions-food"
    const token = window.sessionStorage.getItem("token") || window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") || window.localStorage.getItem("id")
    const imagesURL = process.env.REACT_APP_IMAGES_URL
    const [edits, setEdits] = useState<UserEditsFood[]>([])
    const [filteredEdits, setFilteredEdits] = useState<UserEditsFood[]>([])
    const [reason, setReason] = useState("")
    const [openImage, setOpenImage] = useState(false)
    const isSmallScreen = useMediaQuery('(max-width:800px)');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedEdit, setSelectedEdit] = useState<UserEditsFood>({id:"", createdAt: new Date(), judgedAt: new Date()});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [filterModel, setFilterModel] = useState<GridFilterModel>({items: [] });
    const [allergensAll, setAllergensAll] = useState<Allergen[]>([])
    const [oldAllergensTags, setOldAllergensTags] = useState<Allergen[]>([])
    const [newAllergensTags, setNewAllergensTags] = useState<Allergen[]>([])
    const [additivesAll, setAdditivesAll] = useState<Additive[]>([])
    const [oldAdditivesTags, setOldAdditivesTags] = useState<Allergen[]>([])
    const [newAdditivesTags, setNewAdditivesTags] = useState<Additive[]>([])
    const [oldTracesTags, setOldTracesTags] = useState<Allergen[]>([])
    const [newTracesTags, setNewTracesTags] = useState<Allergen[]>([])
    const [processingRequest, setProcessingRequest] = useState(false)
    const [newNutrition, setNewNutrition] = useState<Nut[]>([])
    const [oldNutrition, setOldNutrition] = useState<Nut[]>([])
    const [selectedImage, setSelectedImage] = useState<string|null>(null)
    const [showInactive, setShowInactive] = useState<boolean>(false)
    const [pendingCount, setPendingCount] = useState(0)
    const [showOldInfo, setShowOldInfo] = useState<boolean>(false)
    const [showAcceptDialog, setShowAcceptDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [currentFoodProfile, setCurrentFoodProfile] = useState<FoodLocal | null>(null)
    const [oldImages, setOldImages] = useState({ingredients: "", packaging: "", front: "", nutrition: ""})
    
    useEffect(()=>{
        document.title = "Aportes de usuarios - EF Admin";
        api.get(allergensURL, {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + token
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
                Authorization: "Bearer " + token
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
                Authorization: "Bearer " + token
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

            const pendingEdits = sortedData.filter((row: UserEditsFood) => row.state === "pending");
            setEdits(sortedData)
            setFilteredEdits(pendingEdits)
                
        })
        .catch(error => console.log(error.response))
    },[additivesAll])

    useEffect(()=>{
        if (showInactive){
            setFilteredEdits(edits)
        }
        else{
            setFilteredEdits(edits.filter((row:UserEditsFood) => row.state === "pending"))
        }
    }, [showInactive, edits])

    const bigScreenColumns: GridColDef[] = [
        {field: "createdAt", headerName: "Envíado el", flex: 1, headerClassName: "header-colors", headerAlign: "center", align: "center", 
            type: "date"
        },
        {field: "idUser", headerName: "Usuario", flex: 1.2, headerClassName: "header-colors", headerAlign: "center",
            valueGetter: (params) => params.row.user?.email
        },
        {field: "product_name", headerName: "Producto", flex: 2, headerClassName: "header-colors", headerAlign: "center", align: "center",
            valueGetter: (params) => params.row.foodData?.product_name + " - " + params.row.foodData?.brands?.split(",")[0] || ""
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
            ],
            renderCell: (params) => {
                const state = params.value;
                return ( 
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                        height: '100%',
                    }}>
                    {state==="pending" 
                        ?   <Tooltip title={"Pendiente"} placement="left" arrow>
                                <PendingIcon
                                sx={{ 
                                    color: "primary.main", 
                                }} 
                            />
                            </Tooltip>
                        :  <Tooltip title={state==="accepted" ? "Aceptado" : "Rechazado"} placement="left" arrow>
                                {
                                    state==="accepted"
                                        ?   <CheckCircleIcon sx={{color: "secondary.dark"}}/>
                                        :   <CancelIcon sx={{color: "error.main"}}/>
                                            
                                }
                            </Tooltip>
                        }
                    </Box>
                   
                );
            },
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
                    <Tooltip title={params.row.state === "pending"?"Evaluar aporte":"Ver aporte"} key="edit" placement="left" arrow={true}>
                        <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                            <Visibility/>
                        </IconButton>
                    </Tooltip>
                    {params.row.state !== "pending" && <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                        <IconButton color="error" onClick={() => {
                            setSelectedEdit(params.row);
                            if (params.row.foodLocal){
                                setCurrentFoodProfile(params.row.foodLocal)
                            }
                            setOpenDeleteDialog(true);}}>
                            <DeleteForeverRoundedIcon />
                        </IconButton>
                    </Tooltip>}
                    
                    
                </Box>
            )
        }
    ]

    const smallScreenColumns: GridColDef[] = [
        {field: "product_name", headerName: "Nombre", flex:2, headerClassName: "header-colors", headerAlign: "center", align: "center",
            valueGetter: (params) => params.row.foodData?.product_name + " - " + params.row.foodData?.brands?.split(",")[0] || ""
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
                    <Tooltip title={params.row.state === "pending"?"Evaluar aporte":"Ver aporte"} key="edit" placement="left" arrow={true}>
                        <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                            <Visibility/>
                        </IconButton>
                    </Tooltip>
                    {params.row.state !== "pending" && <Tooltip title="Eliminar" key="delete" placement="right" arrow>
                        <IconButton color="error" onClick={() => {
                            setSelectedEdit(params.row);
                            if (params.row.foodLocal){
                                setCurrentFoodProfile(params.row.foodLocal)
                            }
                            setOpenDeleteDialog(true);}}>
                            <DeleteForeverRoundedIcon />
                        </IconButton>
                    </Tooltip>}
                    
                    
                </Box>
            )
        }
    ]

    const columns = isSmallScreen ? smallScreenColumns : bigScreenColumns;

      const handleDelete = async (id: string) => {
        try {
            await api.delete(`${editsURL}/${id}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            setEdits(edits.filter((edit: UserEditsFood) => edit.id !== id));
            setFilteredEdits(edits.filter((edit: UserEditsFood) => edit.id !== id))
            setSnackbarMessage('Aporte eliminado.');
        } catch (error) {
            console.log(error);
            setSnackbarMessage('Error al intentar eliminar aporte');
        } finally {
            setOpenDeleteDialog(false);
            setSnackbarOpen(true);
        }
    };

    const handleSwitchChange = (newValue:boolean) => {
        setShowOldInfo(newValue)
    };

    const handleEdit = (edit: any) => {
        setSelectedEdit(edit);
        if (edit.foodLocal){
            setCurrentFoodProfile(edit.foodLocal)
        }
        setNewNutrition([
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
        setOldNutrition([
            { label: "Energía (kcal)", value: edit.foodLocal.foodData.nutriments["energy-kcal_100g"] || "" },
            { label: "Proteínas (g)", value: edit.foodLocal.foodData.nutriments.proteins_100g || "" },
            { label: "Grasa total (g)", value: edit.foodLocal.foodData.nutriments.fat_100g || "" },
            { label: "G. Saturadas (g)", value: edit.foodLocal.foodData.nutriments["saturated-fat_100g"] || "" },
            { label: "G. Monoinsat. (g)", value: edit.foodLocal.foodData.nutriments["monounsaturated-fat_100g"] || "" },
            { label: "G. Poliinsat. (g)", value: edit.foodLocal.foodData.nutriments["polyunsaturated-fat_100g"] || "" },
            { label: "G. Trans (g)", value: edit.foodLocal.foodData.nutriments["trans-fat_100g"] || "" },
            { label: "Colesterol (mg)", value: edit.foodLocal.foodData.nutriments["cholesterol_value"] || "" },
            { label: "H. de C. Disp. (g)", value: edit.foodLocal.foodData.nutriments["carbohydrates_100g"] || "" },
            { label: "Azúcares totales (g)", value: edit.foodLocal.foodData.nutriments["sugars_100g"] || "" },
            { label: "Sodio (mg)", value: edit.foodLocal.foodData.nutriments["sodium_value"] || "" },
          ])  
        const newAllergensTags = edit.foodData.allergens?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results
        const oldAllergensTags = edit.foodLocal.foodHasAllergen
            ?.filter((oldAllergen: FoodHasAllergen) => oldAllergen.isAllergen)
            .map((oldAllergen: FoodHasAllergen) => oldAllergen.allergen) || [];

        const newTracesTags = edit.foodData.traces?.split(", ").map((tagId: string) => 
            allergensAll.find(allergen => allergen.id === tagId)
        ).filter(Boolean) as Allergen[]; // Filter out any undefined results
        const oldTracesTags = edit.foodLocal.foodHasAllergen
            ?.filter((oldTrace: FoodHasAllergen) => oldTrace.isTrace)
            .map((oldTrace: FoodHasAllergen) => oldTrace.allergen) || [];


        const newAdditivesTags = edit.foodData.additives?.split(", ").map((tagId: string) => 
            additivesAll.find(additive=> additive.id === tagId)
        ).filter(Boolean) as Additive[]; // Filter out any undefined results
        const oldAdditivesTags = edit.foodLocal.foodHasAdditive?.map((oldAdditive:FoodHasAdditive)=> oldAdditive.additive)

        let images = {
            ingredients: "Sin imágen",
            packaging: "Sin imágen",
            nutrition: "Sin imágen",
            front: "Sin imágen"
        }
        if (edit.foodLocal.foodData.selected_images){
            edit.foodLocal.foodData.selected_images.front?.display
                ? images.front = edit.foodLocal.foodData.selected_images.front.display.es
                                    || edit.foodLocal.foodData.selected_images.front.display.en 
                                    || edit.foodLocal.foodData.selected_images.front.display.fr 
                                    || "noPhoto" 
                : images.front = "noPhoto"
            edit.foodLocal.foodData.selected_images.nutrition?.display
            ? images.nutrition = edit.foodLocal.foodData.selected_images.nutrition.display.es
                        || edit.foodLocal.foodData.selected_images.nutrition.display.en 
                        || edit.foodLocal.foodData.selected_images.nutrition.display.fr 
                        || "noPhoto" 
            : images.nutrition = "noPhoto"
            edit.foodLocal.foodData.selected_images.packaging?.display
            ? images.packaging = edit.foodLocal.foodData.selected_images.packaging.display.es
                        || edit.foodLocal.foodData.selected_images.packaging.display.en 
                        || edit.foodLocal.foodData.selected_images.packaging.display.fr 
                        || "noPhoto" 
            : images.packaging = "noPhoto"
            edit.foodLocal.foodData.selected_images.ingredients?.display
            ? images.ingredients = edit.foodLocal.foodData.selected_images.ingredients.display.es
                        || edit.foodLocal.foodData.selected_images.ingredients.display.en 
                        || edit.foodLocal.foodData.selected_images.ingredients.display.fr 
                        || "noPhoto" 
            : images.ingredients = "noPhoto"
        }

        setOldImages(images)
        setNewAllergensTags((newAllergensTags || []).sort((a, b) => a.name.localeCompare(b.name)));
        setOldAllergensTags((oldAllergensTags || []).sort((a:Allergen, b:Allergen) => a.name.localeCompare(b.name)));
        setNewTracesTags((newTracesTags || []).sort((a, b) => a.name.localeCompare(b.name)));
        setOldTracesTags((oldTracesTags || []).sort((a:Allergen, b:Allergen) => a.name.localeCompare(b.name)));
        setNewAdditivesTags((newAdditivesTags || []).sort((a, b) => a.name.localeCompare(b.name)));
        setOldAdditivesTags((oldAdditivesTags || []).sort((a:Additive, b: Additive) => a.name.localeCompare(b.name)));
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setReason("")
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleOpenImage = (link:string) => {
        setSelectedImage(link)
        setOpenImage(true)
    }

    const handleCloseImage = () => {
        setOpenImage(false)
    }

    const handleAcceptConfirmation = () => {
        setShowAcceptDialog(true)
    }

    const handleRejectConfirmation = () => {
        setShowRejectDialog(true)
    }

    const handleStateChange = async (id:string, newState: string, rejectReason?: string) => {
        setProcessingRequest(true)
        try {
            const formData = new FormData();
            const change = {
                ...selectedEdit,
                state: newState,
                rejectReason: rejectReason,
                idJudge: currentUserId,
            }
            let res = await api.post(`${editsURL}/${id}/evaluate`,
                change,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }
            )
            const updatedEdits:any = edits.map((edit:any) => 
                edit.id === id ? { 
                    ...edit, 
                    state: newState,
                    rejectReason,
                    idJudge: id
                    } : edit
            );
            setEdits(updatedEdits);
            if (selectedEdit?.id === id) {
                setSelectedEdit((prevEdit:any) => ({
                    ...prevEdit,
                    state: newState,
                    rejectReason,
                    idJudge: id
                }));
            }
            setSnackbarMessage('Aporte evaluado con éxito');
            setSnackbarOpen(true)     
        }
        catch (error){
            console.log(error)
        }
        finally{
            setProcessingRequest(false)
            setShowAcceptDialog(false)
            setShowRejectDialog(false)
        }
       
    };

    useEffect(()=>{
        const pendingEdits = edits.filter((row: UserEditsFood) => row.state === "pending");
        setPendingCount(pendingEdits.length)
        onPendingCountChange(pendingEdits.length)
    }, [edits])

    const CustomToolbar: React.FC = () => {
        const isSmallScreen = useMediaQuery('(max-width:600px)')
        return(
        
        <GridToolbarContainer
        sx={{
            border: "2px solid",
            borderColor: 'primary.dark', // Change the background color
        }}>
            {
                !isSmallScreen && <>
                    <GridToolbarColumnsButton/>
                    <GridToolbarFilterButton/>
                    <GridToolbarDensitySelector/>
                    <GridToolbarExport />
                </>
            }
            
            <Tooltip
                title={showInactive ? "Ocultar aportes evaluados" : "Mostrar aportes evaluados"}
                key="toggle"
                placement="bottom"
                >
                <Button
                    onClick={() => setShowInactive((prev) => !prev)}
                    sx={{ fontSize: 13, gap:1 }}
                >
                    {showInactive ? <VisibilityOff/> : <Visibility/>}
                    {showInactive ? <>Ocultar evaluados</> : <>Mostrar evaluados</>}
                </Button>
            </Tooltip>
        </GridToolbarContainer>
    )};

    return ( 
        <Grid container 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        sx={{width: "100vw", maxWidth:"1000px", gap:"10px"}}>
            
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width:"90vw",
                maxWidth: "1000px",
                overflow: "auto",
                
            }}>
                <DataGrid 
                    rows={filteredEdits}
                    columns={columns}
                    rowHeight={32}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    getRowClassName={(params) => {
                        if (params.row.state === "pending") {
                            return "row-pending";
                        }
                        return params.indexRelativeToCurrentPage % 2 === 0 ? "row-even" : "row-odd";
                    }}
                    slots={{ toolbar: CustomToolbar }}
                    pageSizeOptions={[5, 10]}
                    filterModel={filterModel}
                    onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText} // Apply locale directly
                    sx={{
                        
                        width: "100%", 
                        minWidth: 0,
                        '& .MuiDataGrid-menuIconButton': {
                            display: isSmallScreen ? 'none' : 'block', // Hide on mobile
                            color: 'primary.contrastText', // Change column menu icon color
                        },
                        '& .row-pending': {
                            backgroundColor: 'warning.light',
                            fontFamily: "Montserrat"
                        },
                        '& .MuiDataGrid-sortIcon': {
                            color: 'primary.contrastText', // Change sort icon color
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
                    {
                        pendingCount===0 && isSmallScreen &&
                        <Typography variant="h6">
                            No hay aportes pendientes
                        </Typography>
                    }
                    {
                        pendingCount>0 && isSmallScreen && 
                        <Typography variant="h6">
                            {pendingCount===1
                                ? <>1 aporte pendiente</>
                                : <>{pendingCount} aportes pendientes</>
                            }   
                        </Typography>
                    }

                    <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
                        PaperProps={{
                            sx: {
                                maxHeight: '80vh', 
                                width: "100vw",
                                maxWidth: "400px",
                                margin:0
                            }
                        }} 
                    >
                        <DialogTitle>Borrar aporte</DialogTitle>
                        <DialogContent>
                            ¿Seguro que desea borrar este aporte?
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
                    <Dialog open={showAcceptDialog} onClose={() => setShowAcceptDialog(false)}
                        PaperProps={{
                            sx: {
                                maxHeight: '80vh', 
                                width: "100vw",
                                maxWidth: "500px",
                                margin:0
                            }
                        }}     
                    >
                        <DialogTitle>Aprobar aporte</DialogTitle>
                        <DialogContent>
                            {
                                processingRequest
                                ?  <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                    <CircularProgress></CircularProgress>
                                    <Typography variant="subtitle1">
                                        Envíando información a OpenFoodFacts...
                                    </Typography>
                                </Box>
                                :<Typography variant="subtitle1">
                                    ¿Seguro que desea aprobar este aporte? La información será envíada a la base de datos de OpenFoodFacts.
                                    (Enviar aportes con imágenes puede tardar más tiempo de lo normal).
                                </Typography>
                            }
                            
                        </DialogContent>
                        <DialogActions>
                            {
                                !processingRequest && <>
                                    <Button onClick={() => setShowAcceptDialog(false)} color="primary">
                                        No
                                    </Button>
                                    <Button onClick={()=>handleStateChange(selectedEdit.id, "accepted")} variant="contained" color="primary">
                                        Sí
                                    </Button>
                                </>
                            }
                            
                        </DialogActions>
                    </Dialog>
                    <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}
                        PaperProps={{
                            sx: {
                                maxHeight: '80vh', 
                                width: "100vw",
                                maxWidth: "500px",
                                margin:0
                            }
                        }}     
                    >
                        <DialogTitle>Rechazar aporte</DialogTitle>
                        <DialogContent>
                            <Box sx={{display: "flex", width: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                            {
                                processingRequest
                                ?  <>
                                    <CircularProgress></CircularProgress>
                                    <Typography variant="subtitle1">
                                        Eliminando aporte...
                                    </Typography>
                                </>
                                :   <>
                                    <Typography variant="subtitle1" sx={{pb:1}}>
                                    ¿Seguro que desea rechazar este aporte?
                                    </Typography>
                                    <TextField 
                                    fullWidth
                                    value={reason} 
                                    label="Razón de rechazo"  
                                    inputProps = {{maxLength: 100}}
                                    variant="standard"
                                    onChange={(e) => setReason(e.target.value)}
                                    multiline
                                    rows={2}/>
                                </>
                            }
                            
                                
                            </Box>
                            
                        </DialogContent>
                        <DialogActions>
                            <Button  onClick={() => setShowRejectDialog(false)} color="primary">
                                No
                            </Button>
                            <Button variant="contained" disabled={reason===""} onClick={()=>handleStateChange(selectedEdit.id, "rejected", reason)} color="error">
                                Sí
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}
                    PaperProps={{
                        sx: { 
                          width: "100vw", 
                          maxWidth: "800px", 
                          margin: "auto"
                        }
                      }}>
                        <DialogTitle sx={{
                            bgcolor: selectedEdit.state==="pending"? "primary.dark": selectedEdit.state==="rejected"?"error.main":"secondary.main", 
                            color: selectedEdit.state==="pending"? "primary.contrastText": selectedEdit.state==="rejected"?"error.contrastText":"secondary.contrastText"
                        }}>
                            <Box sx={{
                                display:"flex", 
                                justifyContent: "space-between",
                                alignItems: "flex-start"
                                
                            }}> 
                                <Box sx={{display: "flex", flexDirection: "column", justifyContent: "flex-start"}}>
                                    {selectedEdit.state==="pending"?<> Evaluar aporte </>: selectedEdit.state==="rejected"?<>Aporte rechazado</>:<>Aporte aceptado</>}
                                    {
                                        selectedEdit.state==="pending" &&
                                        <Typography variant="subtitle1" sx={{pt:1, color: "secondary.main"}}>
                                            Datos en color verde son información nueva o editada
                                        </Typography>
                                    } 
                                </Box>
                               
                                <IconButton
                                color="inherit"
                                onClick={handleCloseEditDialog}
                                sx={{p:0}}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{
                            position: "relative", // Makes positioning of child elements relative to this container
                            overflowY: "auto", // Ensures other content can scroll
                            maxHeight: "600px", // Set a max height to limit the content area
                        }}> 
                            {
                              selectedEdit.rejectReason && 
                              <Typography variant="subtitle1" sx={{pt:1}}>
                                <strong>Razón de rechazo: </strong>{selectedEdit.rejectReason}
                              </Typography> 
                            }   

                            {
                              selectedEdit.state === "pending" && 
                              <>
                                <Box sx={{
                                     display: "flex",
                                     alignItems: "center",
                                     justifyContent: "center",
                                     flexDirection: "column",
                                     position: "sticky", // Stick to the top when scrolling
                                     top: 0, // Sticks to the top of the container
                                     bgcolor: "background.paper", // Set background color to match dialog to avoid overlap
                                     zIndex: 1, // Ensure it stays above other content
                                     paddingBottom: 1, // Add spacing below the sticky section
                                     width: "100%",

                                }} 
                                >
                                
                                <RadioGroup
                                    row
                                    value={showOldInfo ? "old" : "new"} // Sets the selected value
                                    onChange={(e) => handleSwitchChange(e.target.value === "old")} // Passes boolean to your handler
                                >
                                    <FormControlLabel 
                                        value="new" 
                                        control={<Radio size="small" />} 
                                        label={<Typography variant="subtitle1" sx={{ textDecoration: "underline" }}>Ver aporte</Typography>} 
                                    />
                                    <FormControlLabel 
                                        value="old" 
                                        control={<Radio size="small" />} 
                                        label={<Typography variant="subtitle1" sx={{ textDecoration: "underline" }}>Ver perfil de alimento actual</Typography>} 
                                    />
                                </RadioGroup>
                            </Box>
                              
                            </>
                            }       
                            <Typography variant='h6' sx={{my: 1}}>
                                Información general
                            </Typography>
                            {
                                showOldInfo
                                    ?   <Box sx={{pl:2}}>
                                        <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Código: </span>{currentFoodProfile?.foodData?.id}</li>
                                        </Typography>
                                         <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Nombre: </span>{currentFoodProfile?.foodData?.product_name}</li>
                                        </Typography>
                                        <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Cantidad: </span>{currentFoodProfile?.foodData?.quantity}</li>
                                        </Typography>
                                        <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Porción: </span>{currentFoodProfile?.foodData?.serving_size}</li>
                                        </Typography>
                                        <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Marca: </span>{currentFoodProfile?.foodData?.brands}</li>
                                        </Typography>
                                        <Typography variant='subtitle1'>
                                            <li><span style={{fontWeight: "bold"}}>Ingredientes: </span>{currentFoodProfile?.foodData?.ingredients_text}</li>
                                        </Typography>
                                        </Box>
                                    :   <Box sx={{pl:2}}>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.product_name===currentFoodProfile?.foodData?.product_name?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Código: </span>{selectedEdit.foodData?.id}</li>
                                        </Typography>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.product_name===currentFoodProfile?.foodData?.product_name?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Nombre: </span>{selectedEdit.foodData?.product_name}</li>
                                        </Typography>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.quantity===currentFoodProfile?.foodData?.quantity?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Cantidad: </span>{selectedEdit.foodData?.quantity}</li>
                                        </Typography>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.serving_size===currentFoodProfile?.foodData?.serving_size?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Porción: </span>{selectedEdit.foodData?.serving_size}</li>
                                        </Typography>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.brands===currentFoodProfile?.foodData?.brands?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Marca: </span>{selectedEdit.foodData?.brands}</li>
                                        </Typography>
                                        <Typography variant='subtitle1' color={selectedEdit.foodData?.ingredients_text_es===currentFoodProfile?.foodData?.ingredients_text?"primary.dark":"secondary.dark"}>
                                            <li><span style={{fontWeight: "bold"}}>Ingredientes: </span>{selectedEdit.foodData?.ingredients_text_es}</li>
                                        </Typography>
                                        </Box>
                            }
                            <Divider sx={{my:2}}/>
                            {
                                showOldInfo
                                    ?   <> 
                                    <Typography variant='h6'>
                                        Alérgenos
                                    </Typography>
                                    <Typography variant='subtitle1' sx={{my:1}}>
                                        El producto contiene:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {oldAllergensTags.map((oldAllergen:Allergen) => (
                                            <Chip
                                                key={oldAllergen.id}
                                                label={`${oldAllergen.name}`} // Show both id and name
                                            />
                                        ))}
                                    </Box>
                                    <Typography variant='subtitle1' sx={{my:1}}>
                                        El producto puede contener:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {oldTracesTags.map((oldTrace:Allergen) => (
                                            <Chip
                                                key={oldTrace.id}
                                                label={`${oldTrace.name}`} // Show both id and name
                                            />
                                        ))}
                                    </Box>
                                    <Divider />
                                    <Typography variant='h6' my={2}>
                                        Aditivos
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {oldAdditivesTags.map((oldAdditive:Additive) => (
                                            <Chip
                                                key={oldAdditive.id}
                                                label={`${oldAdditive.name || oldAdditive.id}`}
                                            />
                                        ))}
                                    
                                    </Box>
                                    </>
                                    :  <> 
                                    <Typography variant='h6'>
                                        Alérgenos
                                    </Typography>
                                    <Typography variant='subtitle1' sx={{my:1}}>
                                        El producto contiene:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {newAllergensTags.map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={`${tag.name}`} // Show both id and name
                                                sx={{bgcolor: oldAllergensTags.some((oldTag) => oldTag.id === tag.id)
                                                    ? "primary.light"
                                                    : "secondary.light",}}
                                            />
                                        ))}
                                    </Box>
                                    <Typography variant='subtitle1' sx={{my:1}}>
                                        El producto puede contener:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {newTracesTags.map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={`${tag.name}`} // Show both id and name
                                                sx={{bgcolor: oldTracesTags.some((oldTag) => oldTag.id === tag.id)
                                                    ? "primary.light"
                                                    : "secondary.light",}}
                                            />
                                        ))}
                                    </Box>
                                    <Divider />
                                    <Typography variant='h6' my={2}>
                                        Aditivos
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: "start" }}>
                                        {newAdditivesTags.map((tag) => (
                                            <Chip
                                                key={tag.id}
                                                label={`${tag.name || tag.id}`} // Show both id and name
                                                sx={{bgcolor: oldAdditivesTags.some((oldTag) => oldTag.id === tag.id)
                                                    ? "primary.light"
                                                    : "secondary.light",}}
                                            />
                                        ))}
                                    
                                    </Box>
                                    </>
                            }
                            
                            <Divider />
                            <Typography variant='h6' my={2}>
                                Información nutricional
                            </Typography>
                            {
                                showOldInfo
                                    ?   <Box sx={{width:"100%", display: "flex", justifyContent: "flex-start"}}>
                                            <TableContainer component={Paper} sx={{ marginBottom: 2, width:"90%", maxWidth:350 }}>
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
                                                        {oldNutrition.map((nutriment, index)=> (
                                                            <TableRow key={nutriment.label} sx={{ height: 30,  bgcolor:"transparent"}}>
                                                            <TableCell sx={{ padding: '4px 8px' }}>
                                                                <Typography variant="subtitle1">
                                                                    {nutriment.label}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                                                <Typography variant="subtitle1">
                                                                    {typeof nutriment.value === "number" ? nutriment.value.toFixed(1) : nutriment.value || ""}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>    
                                    :   <Box sx={{width:"100%", display: "flex", justifyContent: "flex-start"}}>
                                            <TableContainer component={Paper} sx={{ marginBottom: 2, width:"90%", maxWidth:350 }}>
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
                                                        {newNutrition.map((nutriment, index)=> {
                                                            const matchingNut = oldNutrition.find(oldNutriment => oldNutriment.label === nutriment.label);
                                                            return (
                                                                <>
                                                                <TableRow key={nutriment.label} sx={{ height: 30, bgcolor: matchingNut?.value===nutriment.value?"transparent":"secondary.light"}}>
                                                                <TableCell sx={{ padding: '4px 8px' }}>
                                                                    <Typography variant="subtitle1">
                                                                        {nutriment.label}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                                                    <Typography variant="subtitle1">
                                                                        {typeof nutriment.value === "number" ? nutriment.value.toFixed(1) : nutriment.value || ""}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                            </>
                                                            )
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>   
                            }
                            
                            <Divider />
                            <Typography variant='h6' my={2}>
                                Imágenes
                            </Typography> 

                            {
                                showOldInfo
                                    ?   <Box sx={{
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
                                                 onClick={()=>handleOpenImage(oldImages.ingredients)}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    padding: 0, 
                                                    cursor: "pointer" 
                                                }} 
                                                aria-label="Ver imágen"
                                            >
                                                <img src={oldImages.ingredients}
                                                 alt="Sin imágen" 
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
                                                 onClick={()=>handleOpenImage(oldImages.front)}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    padding: 0, 
                                                    cursor: "pointer" 
                                                }} 
                                                aria-label="Ver imágen"
                                            >
                                                <img src={oldImages.front}
                                                 alt="Sin imágen"  
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
                                                 onClick={()=>handleOpenImage(oldImages.nutrition)}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    padding: 0, 
                                                    cursor: "pointer" 
                                                }} 
                                                aria-label="Ver imágen"
                                            >
                                                <img src={oldImages.nutrition}
                                                 alt="Sin imágen"  
                                                 style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                                 
                                            />
                                            </button>
                                        </Box>
                                        {/* <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width:"100%",
                                        }}>
                                            <Typography variant="subtitle1">
                                                Envasado
                                            </Typography>
                                            <button 
                                                 onClick={()=>handleOpenImage(oldImages.packaging)}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    padding: 0, 
                                                    cursor: "pointer" 
                                                }} 
                                                aria-label="Ver imágen"
                                            >
                                                <img src={oldImages.packaging}
                                                 alt="Sin imágen"  
                                                 style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                                 
                                            />
                                            </button>
                                        </Box> */}
                                        
                                    </Box>
                                    :   <Box sx={{
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
                                                 alt="Sin imágen" 
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
                                                 alt="Sin imágen"  
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
                                                 alt="Sin imágen"  
                                                 style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                                 
                                            />
                                            </button>
                                        </Box>
                                        {/* <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width:"100%",
                                        }}>
                                            <Typography variant="subtitle1">
                                                Envasado
                                            </Typography>
                                            <button 
                                                 onClick={()=>handleOpenImage(`${imagesURL}/${selectedEdit.imagesFolder}/packaging.jpg`)}
                                                style={{ 
                                                    background: "none", 
                                                    border: "none", 
                                                    padding: 0, 
                                                    cursor: "pointer" 
                                                }} 
                                                aria-label="Ver imágen"
                                            >
                                                <img src={`${imagesURL}/${selectedEdit.imagesFolder}/packaging.jpg`}
                                                 alt="Sin imágen"  
                                                 style={{ height: "auto", width: "95%", objectFit: 'cover', marginTop: 10, cursor: "pointer" }} 
                                                 
                                            />
                                            </button>
                                        </Box> */}
                                        
                                    </Box>
                            }
                            
                        </DialogContent>
                        <DialogActions>
                            {!processingRequest? selectedEdit?.state === "pending" && (<>
                                    <Button variant="contained" onClick={handleAcceptConfirmation} color="primary">Aceptar</Button>
                                    <Button variant="contained" onClick={handleRejectConfirmation} color="error">Rechazar</Button>
                                    
                                </>
                            ):<CircularProgress/>} 
                        </DialogActions>
                    </Dialog>
                    <Dialog
                    open={openImage}
                    onClose={handleCloseImage}
                    fullWidth
                    maxWidth="md"
                    >
                        <DialogTitle>
                            <Box sx={{
                                    display:"flex", 
                                    justifyContent: "flex-end",
                                    
                                }}>
                                    <IconButton
                                    color="inherit"
                                    onClick={handleCloseImage}
                                    sx={{p:0}}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <img
                                src={selectedImage || NoPhoto}
                                alt="Sin imágen"
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                            />
                        </DialogContent>
                    </Dialog>
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={snackbarMessage}
                    >
                        <Alert variant="filled" onClose={handleCloseSnackbar} severity={snackbarMessage.includes("Error")?"error":"success"} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                    
            </Box>
        </Grid>
    )

}

export default FoodEditList
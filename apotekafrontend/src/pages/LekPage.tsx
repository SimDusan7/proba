import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';import {
    GridRowsProp,
    GridRowModesModel,
    GridRowModes,
    DataGrid,
    GridColDef,
    GridToolbarContainer,
    GridActionsCellItem,
    GridEventListener,
    GridRowModel,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { axiosInstance } from '../axios/axios';
import { NotificationManager } from 'react-notifications';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { randomIntFromInterval, uuidv4 } from '../helpers/_helpers';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Grid } from '@mui/material';

interface EditToolbarProps {
    setLekovi: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
}
  
function EditToolbar(props: EditToolbarProps) {
    const { setLekovi, setRowModesModel } = props;
  
    const handleClick = () => {
        const id = uuidv4();
        setLekovi((oldRows : any) => [...oldRows, { id: id, name: '', rokTrajanja: '', namena: '', isNew: true }]);
        setRowModesModel((oldModel) => ({...oldModel, [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' } }));
    };
  
    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>Dodaj Novi Lek</Button>
        </GridToolbarContainer>
    );
}

const LekPage = () => {
    const [lekovi, setLekovi] = useState<any>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [grupeLekova, setGrupeLekova] = useState<any>([]);
    const [farmaceutskeKuce, setFarmaceutskeKuce] = useState<any>([]);
    const [apoteke, setApoteke] = useState<any>([]);
    const [fKuca, setFKuca] = useState('');
    const [grupa, setGrupa] = useState('');
    const [apoteka, setApoteka] = useState('');
    const [reloadLekovi, setReloadLekovi] = useState(0);
    

    const handleChangeFkuca = (event: SelectChangeEvent) => {
        setGrupa('');
        setApoteka('');
        setFKuca(event.target.value as string);
    };
    const handleChangeGrupa = (event: SelectChangeEvent) => {
        setGrupa(event.target.value as string);
        setApoteka('');
        setFKuca('');
    };
    const handleChangeApoteka = (event: SelectChangeEvent) => {
        setGrupa('');
        setApoteka(event.target.value as string);
        setFKuca('');
    };
    const fetchFarmaceutskeKuce = async () => {
        const response = await axiosInstance.get('/FarmaceutksaKuca');
        console.log(response);
        setFarmaceutskeKuce(response.data);
    };
    const fetchGrupeLekova = async () => {
        const response = await axiosInstance.get('/GrupaLekova');
        console.log(response);
        setGrupeLekova(response.data);
    };
    const fetchApoteke = async () => {
        const response = await axiosInstance.get('/Apoteka');
        console.log(response);
        setApoteke(response.data);
    };
  
    useEffect(() => {
        fetchLekovi();
    }, [reloadLekovi]);

    useEffect(() => {
        fetchApoteke();
        fetchFarmaceutskeKuce();
        fetchGrupeLekova();
    }, [])

    const fetchLekovi = async () => {
        const response = await axiosInstance.get('/Lek');
        console.log(response);
        setLekovi(response.data);
    };
    const handleFindGrupa = async () => {
        const response = await axiosInstance.get(`/Lek/grupal/${grupa}`);
        setLekovi(response.data);
    }
    const handleFindFkuca = async () => {
        const response = await axiosInstance.get(`/Lek/fkucu/${fKuca}`);
        setLekovi(response.data);
    }
    const handleFindApoteka = async () => {
        const response = await axiosInstance.get(`/Lek/apoteka/${apoteka}`);
        setLekovi(response.data);
    }
    
    const handleDeleteClick = async (r: any) => {
        var response = await axiosInstance.delete(`/Lek/lekovi/${r.name}`);
        if(response.status === 200) {
            NotificationManager.success('Lek uspesno izbrisan.');
        }
        else {
            NotificationManager.error('Doslo je do greske prilikom brisanja leka.')
        }
        setLekovi(lekovi.filter((row : any) => row.id !== r.id));
    }

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };
    
    const handleEditClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.Edit } });
    };
    
    const handleSaveClick = (row: any) => {
        setRowModesModel({ ...rowModesModel, [row.id]: { mode: GridRowModes.View } });
    };
    
    const handleCancelClick = (r: any) => {
        setRowModesModel({
            ...rowModesModel,
            [r.id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    
        const editedRow : any = lekovi.find((row : any) => row.id === r.id);
            if (editedRow!.isNew) {
                setLekovi(lekovi.filter((row : any) => row.id !== r.id));
        }
    };
    
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        const updatedRow = { ...newRow, isNew: false };
        var response;
        if(newRow.isNew) {
            var obj = {...newRow, id: randomIntFromInterval()};
            response = await axiosInstance.post(`/Lek`, obj); 
            if(response.status === 200) {
                NotificationManager.success('Lek uspesno dodat.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom dodavanja leka.')
            }
        }
        else {
            response = await axiosInstance.put(`/Lek/${oldRow.name}`, newRow); 
            if(response.status === 200) {
                NotificationManager.success('Lek uspesno izmenjen.');
            }
            else {
                NotificationManager.error('Doslo je do greske prilikom menjanja leka.')
            }
        }
        setLekovi(lekovi.map((row : any) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };
      
    const columns = (handleDelete: Function) : GridColDef[] => [
        {
            field: 'name',
            headerName: 'Naziv',
            flex: 1,
            editable: true,
        },
        {
            field: 'rokTrajanja',
            headerName: 'Rok Trajanja',
            flex: 1,
            editable: true,
        },
        {
            field: 'namena',
            headerName: 'Namena',
            flex: 1,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: (params) => {
                const isInEditMode = rowModesModel[params.row.id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                        return [
                            <GridActionsCellItem
                                icon={<SaveIcon />}
                                label="Save"
                                sx={{
                                color: 'primary.main',
                                }}
                                onClick={() => handleSaveClick(params.row)}
                            />,
                            <GridActionsCellItem
                                icon={<CancelIcon />}
                                label="Cancel"
                                className="textPrimary"
                                onClick={() => handleCancelClick(params.row)}
                                color="inherit"
                            />,
                        ];
                }
        
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => handleEditClick(params.row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => handleDelete(params.row)}
                        color="inherit"
                    />,
                ];
            },
        }
    ];

    return(
        <div>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Grupa</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={grupa}
                                label="Grupa"
                                onChange={handleChangeGrupa}
                            >
                                { 
                                    grupeLekova?.map((el: any, index: number) => {
                                        return(
                                            <MenuItem value={el.naziv} key={index}>{el.naziv}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>   
                <Grid item>
                    <Button variant='outlined' onClick={() => { setGrupa(''); setReloadLekovi(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindGrupa(); }}>Pronadji lek</Button>
                </Grid>
            </Grid>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Apoteka</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={apoteka}
                                label="Apoteka"
                                onChange={handleChangeApoteka}
                            >
                                { 
                                    apoteke?.map((el: any, index: number) => {
                                        return(
                                            <MenuItem value={el.naziv} key={index}>{el.naziv}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>   
                <Grid item>
                    <Button variant='outlined' onClick={() => { setApoteka(''); setReloadLekovi(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindApoteka(); }}>Pronadji lek</Button>
                </Grid>
            </Grid>
            <Grid container display={"flex"} justifyContent={"space-between"} mb={2}>
                <Grid item>
                    <Box sx={{ minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Farmaceutska kuca</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={fKuca}
                                label="Farmaceutske kuce"
                                onChange={handleChangeFkuca}
                            >
                                { 
                                    farmaceutskeKuce?.map((el: any, index: number) => {
                                        return(
                                            <MenuItem value={el.naziv} key={index}>{el.naziv}</MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>   
                <Grid item>
                    <Button variant='outlined' onClick={() => { setFKuca(''); setReloadLekovi(value => value + 1); }}>Osvezi tabeli na pocetno stanje</Button>
                    <Button sx={{ marginLeft: '10px !important' }} variant='contained' onClick={() => { handleFindFkuca(); }}>Pronadji lek</Button>
                </Grid>
            </Grid>
            <Box sx={{ height: 800, width: '100%' }}>
                <DataGrid
                    rows={lekovi}
                    columns={columns(handleDeleteClick)}
                    initialState={{
                        pagination: {
                                paginationModel: {
                                pageSize: 25,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={(newRow, oldRow) => processRowUpdate(newRow, oldRow)}
                    slots={{
                        toolbar: EditToolbar,
                    }}
                    slotProps={{
                        toolbar: { setFarmaceutskeKuce, setRowModesModel },
                    }}
                />
            </Box>
        </div>
    )
}

export default LekPage;

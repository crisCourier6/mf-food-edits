import React, { useEffect, useState } from 'react';
import api from '../api';
import { Badge } from '@mui/material';
import FoodListIcon from '../svgs/FoodListIcon';

const FoodEditPendingCount: React.FC<{height?: string, width?:string}> = ({height="100%", width="100%"}) => {
    const token = window.sessionStorage.getItem("token") ?? window.localStorage.getItem("token")
    const currentUserId = window.sessionStorage.getItem("id") ?? window.localStorage.getItem("id")
    const [pendingCount, setPendingCount] = useState(0)
    const foodEditCountURL = "/submissions?pendingcount=true"
    
    useEffect(() => {
        if (currentUserId){
            api.get(`${foodEditCountURL}`, {
                withCredentials: true,
                headers: {
                    Authorization: "Bearer " + token
                }
            })
            .then(res => {
                setPendingCount(res.data.pendingCount)
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
        }
        
    }, []);

    return ( 
        <Badge
            badgeContent={pendingCount}
            color={pendingCount > 0 ? "warning" : "default"} // red if count > 0, grey otherwise
            overlap="circular"
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
        >
            <FoodListIcon width={width} height={height}/>
        </Badge> 
    )
}

export default FoodEditPendingCount;
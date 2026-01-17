import axios from "axios"
import { BACKEND_URL } from "../config"

async function getRooom(slug: string){

    const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
}

export default function ChatRoom({
    params
}:{
    params:{
        slug: string
    }
}){
    const slug = params.slug
}
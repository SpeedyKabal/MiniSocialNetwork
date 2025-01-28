import api from '../../api'

export const currentUserLoader = async () => {
    const res = await api.get("/api/currentuser/");

    return res.data
}
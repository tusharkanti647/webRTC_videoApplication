import { useNavigate } from "react-router";

function NoteFoundPage() {
    const navigate = useNavigate();
    const handelSignIn = () => {
        navigate('/SignIn');
    }
    return (<div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '30px', fontWeight: 'bold' }}> 404 Page Not Found</p>


        <p style={{ marginTop: '20px' }}>Go to login Page please click here</p>
        <button style={{ marginTop: '20px', padding: '10px', color: 'blue' }} onClick={handelSignIn}>SignIn</button>

    </div>)
}
export default NoteFoundPage;
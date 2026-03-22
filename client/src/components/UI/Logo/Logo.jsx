import logoImage from './logo.png'

const Logo = (props) => {
    const {Width, Height} = props;
    return ( 
        <img alt='Logo' src={logoImage} width={Width} height={Height}/>
     );
}
 
export default Logo;
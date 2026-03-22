import classes from "./footer.module.css";
import SocialLink from "../UI/SocialLink/SocialLink";

import vk from './vk.svg';
import gitHub from './gitHub.svg';

const Footer = () => {
    return (
        <footer className={classes.footer}>
            <div className="container">
                <div className={classes.footer_wrapper}>
                    <div className={classes.copyright}>
                        <p>© 2024 MindX</p>
                    </div>
                    <ul className={classes.social}>
                        <li className={classes.social_item}>
                            <SocialLink Alt={'GitHub'} LinkImage={gitHub} Link={"https://github.com/ntlifee"} Width={"20px"} />
                        </li>
                        <li className={classes.social_item}>
                            <SocialLink Alt={'GitHub'} LinkImage={gitHub} Link={"https://github.com/CsharpMaster37"} Width={"20px"} />
                        </li>
                        <li className={classes.social_item}>
                            <SocialLink Alt={'Vk'} LinkImage={vk} Link={"https://vk.com/id273271929"} Width={"20px"} />
                        </li>
                    </ul>

                </div>
            </div>
        </footer>
    );
}

export default Footer;
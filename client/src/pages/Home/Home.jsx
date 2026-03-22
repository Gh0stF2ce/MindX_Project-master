import classes from './home.module.css'

const Home = () => {
    return (
        <>
            <main className={classes.section}>
                <h1 className={classes.title_home}>Mind<strong className={classes.strong_X}>X</strong></h1>
                <p className={classes.description_home}>
                    Современный сервис для организации интеллектуальных игр
                </p>
            </main>
        </>
    );
}

export default Home;
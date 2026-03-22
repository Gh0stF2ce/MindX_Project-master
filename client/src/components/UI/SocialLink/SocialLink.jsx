const SocialLink = (prop) => {
    const { Alt, LinkImage, Link, Width } = prop;
    return (
        <a style={{ width: Width, display: "inline-block" }} href={Link}>
            <img src={LinkImage} alt={Alt} />
        </a>
    );
}

export default SocialLink;
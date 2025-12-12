import logo from "../logo.svg";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
    return (
        <nav className="navbar bg-body-tertiary" data-bs-theme="light">
            <div className="container-fluid">
                <span className="navbar-brand d-flex flex-row justify-content-start align-items-center mb-0 h1">
                    <img src={logo} alt="company" width={50} />
                    <span>Company</span>
                </span>
            </div>
        </nav>
    );
};

export default Navbar;

import logo from "../logo.svg";

const Navbar = () => {
    return (
        <nav class="navbar bg-body-tertiary" data-bs-theme="light">
            <div class="container-fluid">
                <span class="navbar-brand d-flex flex-row justify-content-start align-items-center mb-0 h1">
                    <img src={logo} alt="company" width={50} />
                    <span>Company</span>
                </span>
            </div>
        </nav>
    );
};

export default Navbar;

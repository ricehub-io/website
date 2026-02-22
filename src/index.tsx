import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import "./style.css";
import Header from "./components/Header.jsx";
import NotFoundPage from "./pages/_404.jsx";
import HomePage from "./pages/home";
import RicePage from "./pages/rice";
import { AppState, createAppState } from "./lib/appState";
import ModalConsumer from "./components/ModalConsumer";
import NotificationConsumer from "./components/NotificationConsumer";
import AccountPage from "./pages/account";
import NewRicePage from "./pages/new-rice";
import EditRicePage from "./pages/edit-rice";
import AdminPage from "./pages/admin";
import AdminRoute from "./components/AdminRoute";
import ProfilePage from "./pages/profile";
import Footer from "./components/Footer";
import PrivacyPolicyPage from "./pages/privacy-policy";
import TermsOfServicePage from "./pages/terms-of-service";

export function App() {
    // const [theme, setTheme] = useState<"default" | "everforest">("default");

    // useEffect(() => {
    //     document.documentElement.className = `theme-${theme}`;
    // }, [theme]);

    return (
        <LocationProvider>
            <AppState.Provider value={createAppState()}>
                <Header />
                <main className="m-4 h-full flex-col">
                    <Router>
                        <Route path="/" component={HomePage} />
                        <Route path="/account" component={AccountPage} />
                        <Route
                            path="/edit-rice/:riceId"
                            component={EditRicePage}
                        />
                        <Route path="/new-rice" component={NewRicePage} />
                        <AdminRoute path="/admin" component={AdminPage} />
                        <Route
                            path="/privacy-policy"
                            component={PrivacyPolicyPage}
                        />
                        <Route
                            path="/terms-of-service"
                            component={TermsOfServicePage}
                        />
                        <Route path="/:username" component={ProfilePage} />
                        <Route path="/:username/:slug" component={RicePage} />
                        <Route default component={NotFoundPage} />
                    </Router>
                    <ModalConsumer />
                    <NotificationConsumer />
                </main>
                <Footer />
            </AppState.Provider>
        </LocationProvider>
    );
}

render(<App />, document.getElementById("app"));

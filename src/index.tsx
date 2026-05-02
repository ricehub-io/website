import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import "./style.css";
import AdminRoute from "@/components/AdminRoute";
import AuthRoute from "@/components/AuthRoute";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ModalConsumer from "@/components/ModalConsumer";
import NotificationConsumer from "@/components/NotificationConsumer";
import { AppState, createAppState } from "@/lib/appState";
import NotFoundPage from "@/pages/_404";
import AccountPage from "@/pages/account";
import AdminPage from "@/pages/admin";
import EditRicePage from "@/pages/edit-rice";
import HomePage from "@/pages/home";
import NewRicePage from "@/pages/new-rice";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import ProfilePage from "@/pages/profile";
import RicePage from "@/pages/rice";
import TermsOfServicePage from "@/pages/terms-of-service";
import LeaderboardPage from "@/pages/leaderboard";

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
                        <AuthRoute path="/account" component={AccountPage} />
                        <AuthRoute
                            path="/edit-rice/:riceId"
                            component={EditRicePage}
                        />
                        <AuthRoute path="/new-rice" component={NewRicePage} />
                        <Route
                            path="/privacy-policy"
                            component={PrivacyPolicyPage}
                        />
                        <Route
                            path="/terms-of-service"
                            component={TermsOfServicePage}
                        />
                        <Route
                            path="/leaderboard"
                            component={LeaderboardPage}
                        />
                        <AdminRoute path="/mastermind" component={AdminPage} />
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

render(<App />, document.getElementById("app")!);

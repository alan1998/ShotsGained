import {RouterModule, Routes} from "@angular/router"
import {AppComponent} from "./app.component"
import {MapComponent} from "./map/map.component" //TODO an edit component that includes map etc

const routes:Routes = [
    {path: "course/edit", component : MapComponent},
    {path:"",component: AppComponent}
]

export const routing = RouterModule.forRoot(routes);

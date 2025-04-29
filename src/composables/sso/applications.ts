interface Application {
  name: string;
  names: string;
  namess: string;
  application: string;

}

export const applications: { [key: string]: Application } = {
  crs: {
    name: "Centralized Report System",
    names: "Procurement Management Information ",
    namess: "Procurement Management Information ",
    application: "CRS",
  },
  rrptp: {
    name: "Recovery",
    names: "and Reintegration ",
    namess: "Program for Trafficked Persons",
    application: "RRPTP",
  },
  promisys: {
    name: "Procurement   ",
    names: "Management Information",
    namess: "",
    application: "PROMISYS",
  },
  hr_cares: {
    name: "Human Resources   ",
    names: "Human Resource Comprehensive Access to Records ",
    namess: "and Employee Services ",
    application: "HR-CARES",
  },
  cds: {
    name: "Check ",
    names: "Disbursement System ",
    namess: "",
    application: "",
  },
  ictems: {
    name: "ICT  ",
    names: "Equipment",
    namess: " Monitoring System ",
    application: "",
  },
  bp: {
    name: "Laravel-Blade Broiler Plate",
    names: "",
    namess: "",
    application: "",
  },
  uno_apps: {
    name: "UNO Applications",
    names: "",
    namess: "",
    application: "",
  },
};
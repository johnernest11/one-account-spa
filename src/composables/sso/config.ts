interface SSOApplication {
  url: string;
  application: string;
}



export const applications: { [key: string]: SSOApplication } = {
  hr_cares: {
    url: "http://localhost:3001",
    application: "Human Resources CARES",
  },
  rrptp: {
    url: "http://rrptp-fo1.dswdfo1.internal",
    application: "Recovery and Reintegration Program for Trafficked Persons",
  },
  promisys: {
    url: "http://promisys.dswdfo1.internal/",
    application: "Procurement Management Information System",
  },
  rmds: {
    url: "http://promisys.dswdfo1.internal/",
    application: "Records Management and Disposition System",
  },
  bp: {
    url: "http://broilerplate.dswdfo1.internal/",
    application: "Laravel-Blade Broilerplate",
  },
  uno_apps: {
    url: "http://localhost:9002/",
    application: "UNO Applications",
  },
};

export const serviceName = {
  get(app: string) {
    return applications[app];
  },
};
interface Application {
  name: string;
  names: string;
  namess: string;
  application: string;

}

export const applications: { [key: string]: Application } = {
  hr_cares: {
    name: 'HRCARES',
    names: 'Human Resource Comprehensive Access to Records ',
    namess: 'and Employee Services ',
    application: 'HR-CARES',
  },
}
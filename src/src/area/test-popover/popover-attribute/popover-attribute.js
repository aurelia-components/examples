import {bindable} from 'aurelia-framework';

export class TestPopover {
  constructor() {
    this.popoverTestBinding = 'testing binsfrwjrwerhwrlwehrwklrwjrweklrjwrwelkerjwelrjwerlkewrjdig';
    this.title = 'Title';
    this.content = 'Content1';

    this.popoverTitle = '';
    this.items = [
      {id:"gosho", name:"gosho"},
      {id:"pesho", name:"pesho"},
      {id:"tosho", name:"tosho"}
    ];

    this.placements = [
      {id:"top", name:"top"},
      {id:"bottom", name:"bottom"},
      {id:"left", name:"left"},
      {id:"right", name:"right"}
    ];

    this.placement = this.placements[0];
    this.trigger = 'click';
    this.triggers = [
      {id:"click", name:"click"},
      {id:"hover", name:"hover"},
      {id:"focus", name:"focus"},
      {id:"insideClick", name:"insideClick"}
    ];

    this.people = [
        { id: "bdf99e63-3b8b-4ab6-b006-1f3db4ace827", name: "_236987 - Hardin Gabrielle Bartlett Bright White" },
        { id: "bc0760a0-0858-45d0-a70f-8bb2acd81321", name: "_578094 - Vang Arnold Tucker Gloria Rasmussen" },
        { id: "65339317-bda3-43e7-9a38-bd3a19fb7c45", name: "_510235 - Chase Avery Sellers Kennedy Bates" },
        { id: "79214581-f85e-45a1-bde9-e831e1676e00", name: "_355176 - Harrell Edwina Navarro Hooper Ware" },
        { id: "1ea575b5-8525-4777-be13-19df35f68269", name: "_956641 - Macias Esperanza Oneil Miranda Webb" },
        { id: "d706eff6-26ce-4642-b873-03fc6e0afc06", name: "_302152 - Haley Tate Walls Farrell Vaughan" },
        { id: "9d319a58-d5b6-41c0-9732-85e6d88aa22b", name: "619791 - Wilkins Cornelia Saunders Ophelia Klein" },
        { id: "46c0717f-63c3-4702-b493-7e1cb27fd82e", name: "168725 - Mayer Owens Small Jodie Delgado" },
        { id: "3c9d9edd-d0cf-4e42-aada-2f987cd38461", name: "_706922 - Kane James Wood Erma Bright" },
        { id: "2812df19-bf37-4e3c-984c-eceb89086244", name: "413021 - Schneider Ballard Goff Potter Vinson" },
        { id: "277f1dcb-dc9a-42f8-a30d-932f5f35e969", name: "449326 - House Jacklyn Robbins Deanne Fitzgerald" },
        { id: "7e26215c-e239-4d23-bd84-02c682b9fd92", name: "300823 - Gillespie Angela Fisher Russell Sparks" },
        { id: "5d512c55-cdea-4162-83a0-1229b91faa8a", name: "561986 - Grant Lynnette Logan Christina Cote" },
        { id: "bedd62c1-ed76-408a-9b9c-be2049851beb", name: "906575 - Hammond Pat Cooke Bentley Marks" },
        { id: "7b469fe7-7676-4588-a898-b0e6a440077a", name: "333384 - Mejia Traci Jacobs Casey Wolf" },
        { id: "f1d7b357-08cf-416f-81d1-4c9950671062", name: "_774952 - Hall Hebert Burks Nellie Short" },
        { id: "ef0d1a0d-4b40-4a9c-bbd1-17b3a6f508fe", name: "_318315 - Chavez Hernandez Finley Rosa Johnston" },
        { id: "b7d1a82a-fa70-4794-87b0-c7212b9b9b69", name: "_827312 - Harmon Foley Hays Stevenson Mccarthy" },
        { id: "e71d46d7-a946-45d1-9a23-3b5b4bf04b45", name: "_576625 - Murray Penny Garrison Angelia Payne" },
        { id: "0492bc5d-9ffc-4634-b62a-045d277557ea", name: "350064 - Blackwell Solis Talley Lynn Bailey" },
        { id: "0b06d759-3bc3-45ef-894d-c4ddda2db631", name: "725272 - Carpenter Misty Hendricks Sofia Price" },
        { id: "57cf208c-4a46-41c8-9d99-9ac06a7f3b56", name: "949094 - Holman Debbie Bird Pate Gonzales" },
        { id: "87da91b7-ec36-49ac-a08c-5477fc2a4b1e", name: "323279 - Clark Ratliff Carr Katy Lewis" },
        { id: "721fdbf0-c460-4d00-be6e-a4ee148be285", name: "932045 - Dejesus Frost Larsen Cassie Mcgee" },
        { id: "2c2d6c8a-c303-439d-8f71-8727c5285be8", name: "_223507 - Ryan Rachelle Wheeler Pacheco Herring" },
        { id: "ec82f941-e25d-484a-8bdc-c6f56e89607d", name: "362143 - Hendrix Janis Levy Bush Roach" },
        { id: "9c53638f-48bd-421d-8d6b-acb4aa7bd07c", name: "_109344 - Lindsey Clarissa Shields Sylvia Boone" },
        { id: "325bd073-4f1c-455e-8389-6410575c65d4", name: "138963 - Austin Stanley Brady Wooten Boyle" },
        { id: "6bc6c829-60c2-40eb-966a-1ba6e87781de", name: "_641510 - Castro Allie Spears Tasha Woodard" },
        { id: "094fbd40-099f-4040-a7ee-ce81ccf59481", name: "_197969 - Gallagher Gross Carrillo Ross Murphy" },
        { id: "a1439ff5-4b01-4fc2-8d60-1576f6ee7cad", name: "885493 - Britt Washington Parsons Krista Salas" },
        { id: "64d04064-60fe-4ba4-85c2-f71e0f2b8efe", name: "457672 - Sherman Ina Farmer Winnie Thompson" },
        { id: "dbfeed19-f471-4c57-8673-687267442987", name: "838427 - Levine Shari Webster Clemons Watts" },
        { id: "ab443da3-f191-4dcf-9362-7a21b6e1ed79", name: "934885 - Shaw Leola Wise Aileen Atkinson" },
        { id: "1d184b23-4756-4d02-a1d6-3098e8e76ee2", name: "342500 - Dean Elnora Bradley Chan Mcdaniel" },
        { id: "b7f9be6e-8616-482b-9865-97b8a44861e9", name: "966568 - Drake Velma Luna Beach Joyner" },
        { id: "edcc2b53-4672-466b-9041-d02d0f7d89db", name: "371336 - Schultz Rich Herrera Britt Reese" },
        { id: "0b49aa1d-8f1f-4095-9d4f-88aba0b5d3fa", name: "944031 - Robles Perry Newman Audra Conner" },
        { id: "47fb412d-9695-4306-a965-483f6ae544e4", name: "512328 - Powers Gale Foley Solomon Stanton" },
        { id: "dbff58cc-4b25-4c6e-b6d3-f86c6ecccd48", name: "_858004 - Armstrong Contreras Sears Valdez Cash" },
        { id: "3a7443a5-6070-43a6-9fc7-58fa3af58338", name: "502754 - Baker Adriana Huber Rios Yates" },
        { id: "31f293c7-be8a-4041-b801-ddd038f32e6c", name: "_749638 - Cameron Ashley Mcmahon Leigh Lamb" },
        { id: "3e3369da-e435-4b7c-9b51-0d2189c92667", name: "_507890 - Clements Jewel Owens Frankie Ferrell" },
        { id: "e6692282-7c41-44e7-8056-1bb9a75f81ad", name: "_664059 - Hanson Pittman Sharpe Brittney Moss" },
        { id: "39970c24-39b1-4ad5-bd85-ef45a365a477", name: "969529 - Guy Leonard Byers Barbara Bradshaw" },
        { id: "3ec1f15c-e457-4bbc-9e4c-938d20dfbbf3", name: "_470064 - Stafford Williams Quinn Lesley Watkins" },
        { id: "37e58035-0574-404d-9c27-69ec8f678012", name: "446422 - Fletcher Holt Ward Theresa Lawrence" },
        { id: "52064b8e-d873-4f26-ab39-8744c237ab53", name: "874804 - Meadows Ray Raymond Ryan Hancock" },
        { id: "ecb699c2-1320-4343-9518-a851d2d6f172", name: "457808 - Martin Craft Madden Katelyn Lambert" },
        { id: "8892eea5-0342-406a-9402-75f4e4c5c7b3", name: "_851978 - Downs Rasmussen Odonnell Bettye Doyle" },
        { id: "a330bac0-6725-4c43-a1f4-8e56ae13ac33", name: "805820 - Daniel Mccarthy Harvey Heath Knowles" },
        { id: "c60cf543-336f-4993-ba65-e3614b4d5a38", name: "_135364 - Battle Stevens Davidson Bettie Riggs" },
        { id: "06bc1447-1af5-46e7-a896-d25c0a209ee9", name: "238537 - Sawyer Dorothy Jacobson Therese Hayden" },
        { id: "e0905709-adfb-4a18-9dca-02e2f5aa92d5", name: "_311106 - Leon Susie Finley Barrera Buck" },
        { id: "18fa545b-7b73-46e1-81f7-fc26488d6ca9", name: "274973 - Alston Eddie Pittman Kathy Garza" },
        { id: "0a70de5e-fa17-482c-b7d8-d3d599246001", name: "446004 - Stokes Salinas Albert Priscilla Patterson" },
        { id: "08f7ffc1-3103-49a0-945e-5056cbb99388", name: "490954 - Roman Samantha Delaney Chen Rutledge" },
        { id: "28e4d522-f0fb-4348-bf80-b6d8670ffd49", name: "248050 - Young Barron Silva Tameka Stevenson" },
        { id: "9386955b-9e4e-4de9-adf0-d2452f184d8a", name: "_630969 - Lee Davidson Fernandez Alice Pacheco" },
        { id: "887f7af6-7aee-4a33-8ee3-d8df1964a89b", name: "_393499 - Glass Beasley Dodson Jo Mcclain" },
        { id: "36a69178-ab43-4d5a-88f5-390e83fd6059", name: "771033 - Dyer Morse William Payne Mayo" },
        { id: "cbf6dd32-1c4d-4090-889d-f38f65109f59", name: "449090 - Gamble Emilia Barron Lorna Soto" },
        { id: "3d058db5-7d52-457d-a2b5-cc59ab980896", name: "961934 - Daugherty Julie Garrett Mejia Dorsey" },
        { id: "f234ce0c-6fe1-4649-b688-993997057faf", name: "769601 - Prince Monica Dalton Tisha Benson" },
        { id: "6887849b-9483-4109-8ed5-d7d1c39d3d7c", name: "_849306 - Castaneda Annmarie Alvarez Merritt Nash" },
        { id: "5ca9c55b-7f96-437f-b71e-ca77d877c880", name: "_264243 - Russo Mara Morrow Keith Kerr" },
        { id: "4501950c-367b-4b82-88a0-ccf712b4c140", name: "_478757 - Turner Brewer Hahn Claudine Nielsen" },
        { id: "160f3411-f553-467f-8ed0-c39be9842b29", name: "490346 - Mcneil Pitts Valenzuela Witt Keller" },
        { id: "f8bad5b2-3d4c-4f20-9f6d-1388222b7700", name: "764746 - Snider Sutton Randolph Dee Kidd" }
    ];

    this.selectedPerson = this.people[2];
    window.x = this;
  }

  click() {
    this.content = 'Content2';
    this.x = 'xasdf';

    //let allStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'aCalifornia',
    //  'aColorado', 'aConnecticut', 'aDelaware', 'Florida', 'Georgia', 'Hawaii',
    //  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    //  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    //  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    //  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    //  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    //  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    //  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    //];
  }
}


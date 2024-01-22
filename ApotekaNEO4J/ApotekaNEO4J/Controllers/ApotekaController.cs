using ApotekaNEO4J.Models;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;

namespace ApotekaNEO4J.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApotekaController : Controller
    {
        private readonly IGraphClient _graphClient;
        public ApotekaController(IGraphClient graphClient)
        {
            _graphClient = graphClient;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var apoteke = await _graphClient.Cypher.Match("(a:Apoteka)")
                .Return(a => a.As<Apoteka>()).ResultsAsync;

            return Ok(apoteke);
        }
        [HttpGet("{name}")]
        public async Task<IActionResult> GetApotekaByName(string name)
        {
            var lekovi = await _graphClient.Cypher.Match("(a:Apoteka)").Where((Apoteka a) => a.Naziv == name).Return(a => a.As<Apoteka>()).ResultsAsync;

            return Ok(lekovi.LastOrDefault());
        }

        [HttpPost]
        public async Task<IActionResult> CreateApoteka([FromBody] Apoteka apoteka)
        {
            await _graphClient.Cypher.Create("(a:Apoteka $apoteka)").WithParam("apoteka", apoteka).ExecuteWithoutResultsAsync();

            return Ok();
        }
        [HttpPut("{name}")]
        public async Task<IActionResult> UpdateApoteka(string name, [FromBody] Apoteka apoteka)
        {
            await _graphClient.Cypher.Match("(a:Apoteka)").Where((Apoteka a) => a.Naziv == name).Set("a = $apoteka").WithParam("apoteka", apoteka).ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpDelete("{name}")]//brise apoteku sa relacijama
        public async Task<IActionResult> DeleteApoteka(string name)
        {
            await _graphClient.Cypher.Match("(a:Apoteka)").Where((Apoteka a) => a.Naziv == name).DetachDelete("a").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("{aname}/posedujuzaprodaju/{lname}")]//prsledimo apoteku i lek i pripojimo lek apoteci
        public async Task<IActionResult> ApotekaPosedujeLekove(string aname, string lname) 
        {
            await _graphClient.Cypher.Match("(a:Apoteka),(l:Lek)").Where((Apoteka a, Lek l) => a.Naziv == aname && l.Name == lname).Create("(a)-[:ImaZaProdaju]->(l)").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("grupa/{lname}")]//prosledimo lek i dobijemo u kojim se sve apotekama taj lek nalazi
        public async Task<IActionResult> VratiSveApotekePoLeku(string lname)
        {
            var apoteka = await _graphClient.Cypher.Match("(a:Apoteka)-[r:ImaZaProdaju]->(l:Lek)").Where((Lek l) => l.Name == lname).Return(a => a.As<Apoteka>()).ResultsAsync;
            return Ok(apoteka);
        }
    }
}

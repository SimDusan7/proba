using ApotekaNEO4J.Models;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;
namespace ApotekaNEO4J.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LekController : Controller
    {
        private readonly IGraphClient _graphClient;
        public LekController(IGraphClient graphClient)
        {
            _graphClient = graphClient;
        }
        [HttpGet]
        public async Task<IActionResult> Get() {
            var lekovi = await _graphClient.Cypher.Match("(n:Lek)")
                .Return(n => n.As<Lek>()).ResultsAsync;

            return Ok(lekovi);
        }
        [HttpGet("{name}")]
        public async Task<IActionResult> GetLekByName(string name)
        {
            var lekovi = await _graphClient.Cypher.Match("(l:Lek)").Where((Lek l) => l.Name == name).Return(l => l.As<Lek>()).ResultsAsync;

            return Ok(lekovi.LastOrDefault());
        }

        [HttpPost]
        public async Task<IActionResult> CreateLek([FromBody] Lek lek)
        {
            await _graphClient.Cypher.Create("(d:Lek $lek)").WithParam("lek", lek).ExecuteWithoutResultsAsync();

            return Ok();
        }
        [HttpPut("{name}")]
        public async Task<IActionResult> UpdateLek(string name, [FromBody] Lek lek) 
        {
            await _graphClient.Cypher.Match("(l:Lek)").Where((Lek l)=>l.Name==name).Set("l = $lek").WithParam("lek",lek).ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpDelete("lekovi/{name}")]
        public async Task<IActionResult> DeleteLek(string name)//brise odredjeni lek i njegove veze
        {
            await _graphClient.Cypher.Match("(l:Lek)").Where((Lek l) => l.Name == name).DetachDelete("l").ExecuteWithoutResultsAsync();
            return Ok();
        }
        //[HttpGet("{lname}/assignlekgrupa/{gname}")]//prosledi lek i grupu i pripoji lek odredjenoj grupi
        //public async Task<IActionResult> AssignLekGrupi(string lname, string gname)
        //{
        //    await _graphClient.Cypher.Match("(l:Lek),(g:GrupaLekova)").Where((Lek l, GrupaLekova g) => l.Name == lname && g.Naziv == gname).Create("(l)-[r:LekPripadaGrupi]->(g)").ExecuteWithoutResultsAsync();
        //    return Ok();
        //}
        [HttpGet("apoteka/{aname}")]//prosledi apoteku i vidi koji lekovi se nalaze u noj
        public async Task<IActionResult> VratiSveLekovePoA(string aname)
        {
            var lekovi = await _graphClient.Cypher.Match("(a:Apoteka)-[r:ImaZaProdaju]->(l:Lek)").Where((Apoteka a) => a.Naziv == aname).Return(l => l.As<Lek>()).ResultsAsync;
            return Ok(lekovi);
        }
        [HttpGet("fkucu/{fname}")]//svi lekovi koje pravi prosledjena farmaceutska kuca
        public async Task<IActionResult> VratiSveLekovePoF(string fname)
        {
            var lekovi = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)-[r:LekPraviFarmaceutskaKuca]->(l:Lek)").Where((FarmaceutskaKuca f) => f.Naziv == fname).Return(l => l.As<Lek>()).ResultsAsync;
            return Ok(lekovi);
        }
        [HttpGet("grupal/{gname}")]//svi lekovi koji pripadaju odredjenoj grupi
        public async Task<IActionResult> VratiSveLekovePoG(string gname)
        {
            var lekovi = await _graphClient.Cypher.Match("(g:GrupaLekova)-[r:LekPripadaGrupi]->(l:Lek)").Where((GrupaLekova g) => g.Naziv == gname).Return(l => l.As<Lek>()).ResultsAsync;
            return Ok(lekovi);
        }

    }
}

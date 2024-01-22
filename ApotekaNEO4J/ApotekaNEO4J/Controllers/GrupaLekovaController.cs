using ApotekaNEO4J.Models;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;

namespace ApotekaNEO4J.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GrupaLekovaController : Controller
    {
        private readonly IGraphClient _graphClient;
        public GrupaLekovaController(IGraphClient graphClient)
        {
            _graphClient = graphClient;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var grupeLekova = await _graphClient.Cypher.Match("(g:GrupaLekova)")
                .Return(g => g.As<GrupaLekova>()).ResultsAsync;

            return Ok(grupeLekova);
        }
        [HttpPost]
        public async Task<IActionResult> CreateGrupuLekova([FromBody] GrupaLekova grupa)
        {
            await _graphClient.Cypher.Create("(g:GrupaLekova $grupa)").WithParam("grupa", grupa).ExecuteWithoutResultsAsync();

            return Ok();
        }
        [HttpDelete("{name}")]//brisi odredjenu grupu leka sa njegovim relacijama
        public async Task<IActionResult> DeleteGrupuLekovaSaRelacijama(string name)
        {
            await _graphClient.Cypher.Match("(g:GrupaLekova)").Where((GrupaLekova g) => g.Naziv == name).DetachDelete("g").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("{lname}/assignlekGrupi/{gname}")]//prosledi lek i grupu i dodaj prosledjeni lek prosledjenoj grupi
        public async Task<IActionResult> AssignLekGrupi(string lname, string gname)
        {
            await _graphClient.Cypher.Match("(l:Lek),(g:GrupaLekova)").Where((Lek l, GrupaLekova g) => l.Name == lname && g.Naziv == gname).Create("(g)-[r:LekPripadaGrupi]->(l)").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("fkucu/{fname}")]//prosledi farmaceutsku kucu i vidi koje sve grupe lekova pravi ta Kuca
        public async Task<IActionResult> VratiSveLekovePoF(string fname)
        {
            var lekovi = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)-[r:PraviGrupuLekova]->(g:GrupaLekova)").Where((FarmaceutskaKuca f) => f.Naziv == fname).Return(g => g.As<GrupaLekova>()).ResultsAsync;
            return Ok(lekovi);
        }


    }
}

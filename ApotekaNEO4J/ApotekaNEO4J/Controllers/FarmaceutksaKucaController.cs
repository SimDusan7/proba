using ApotekaNEO4J.Models;
using Microsoft.AspNetCore.Mvc;
using Neo4jClient;
using System.Runtime.Intrinsics.X86;

namespace ApotekaNEO4J.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FarmaceutksaKucaController : Controller
    {
        private readonly IGraphClient _graphClient;
        public FarmaceutksaKucaController(IGraphClient graphClient) 
        {
            _graphClient = graphClient;
        }
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var fKuce = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)")
                .Return(f => f.As<FarmaceutskaKuca>()).ResultsAsync;

            return Ok(fKuce);
        }
        [HttpGet("{name}")]
        public async Task<IActionResult> GetFarmaceutskaKucaByName(string name)
        {
            var farmaceutskeKuce = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)").Where((FarmaceutskaKuca f) => f.Naziv == name).Return(f => f.As<FarmaceutskaKuca>()).ResultsAsync;

            return Ok(farmaceutskeKuce.LastOrDefault());
        }

        [HttpPost]
        public async Task<IActionResult> CreateFarmaceutskaKuca([FromBody] FarmaceutskaKuca fKuca)
        {
            await _graphClient.Cypher.Create("(f:FarmaceutskaKuca $fKuca)").WithParam("fKuca", fKuca).ExecuteWithoutResultsAsync();

            return Ok();
        }
        [HttpPut("{name}")]
        public async Task<IActionResult> UpdateFarmaceutskaKuca(string name, [FromBody] FarmaceutskaKuca fKuca)
        {
            await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)").Where((FarmaceutskaKuca f) => f.Naziv == name).Set("f = $fKuca").WithParam("fKuca", fKuca).ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpDelete("{name}")]//brisemo f kucu sa relacijama
        public async Task<IActionResult> DeleteFarmaceutskaKuca(string name)
        {
            await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)").Where((FarmaceutskaKuca f) => f.Naziv == name).DetachDelete("f").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("{fname}/AssignGrupuFKuci/{gname}")]//prosledimo grupu i f kucu i pripojimo prosledjenu grupu prosledjenoj f kuci
        public async Task<IActionResult> AssignGrupuFkuci(string gname, string fname)
        {
            await _graphClient.Cypher.Match("(f:FarmaceutskaKuca),(g:GrupaLekova)").Where((FarmaceutskaKuca f,GrupaLekova g) => f.Naziv == fname && g.Naziv == gname).Create("(f)-[r:PraviGrupuLekova]->(g)").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("{lname}/assignlekfKuca/{fname}")]//prosledimo lek i f kucu i pripojimo prosledjeni lek prosledjenoj f kuci
        public async Task<IActionResult> AssignLekFarmecutskojKuci(string lname, string fname)
        {
            await _graphClient.Cypher.Match("(l:Lek),(f:FarmaceutskaKuca)").Where((Lek l, FarmaceutskaKuca f) => l.Name == lname && f.Naziv == fname).Create("(f)-[r:LekPraviFarmaceutskaKuca]->(l)").ExecuteWithoutResultsAsync();
            return Ok();
        }
        [HttpGet("grupa/{gname}")]//prosledimo grupu i dobijemo sve farmaceutske kuce koje proizvode tu grupu lekova
        public async Task<IActionResult> VratiSveFkucePoGrupi(string gname)
        {
            var farmaceutskeKuce = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)-[r:PraviGrupuLekova]->(g:GrupaLekova)").Where((GrupaLekova g)=>g.Naziv==gname).Return(f => f.As<FarmaceutskaKuca>()).ResultsAsync;
            return Ok(farmaceutskeKuce);
        }
        [HttpGet("lek/{lname}")]//prosledimo lek i dobijemo sve farmaceutske kuce koje proizvode taj lek
        public async Task<IActionResult> VratiSvePoLeku(string lname)
        {
            var apoteka = await _graphClient.Cypher.Match("(f:FarmaceutskaKuca)-[r:LekPraviFarmaceutskaKuca]->(l:Lek)").Where((Lek l) => l.Name == lname).Return(f => f.As<FarmaceutskaKuca>()).ResultsAsync;
            return Ok(apoteka);
        }

    }
}
